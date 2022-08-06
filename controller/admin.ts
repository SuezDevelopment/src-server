import {ObjectId, create, verify} from '../deps.ts'
import {comparePwd} from '../utils/hashPwd.ts'
import {key} from '../utils/apiKey.ts'
import {AdminSchema, Admin} from '../schema/admin.ts'
import { RouterContext } from '../deps.ts';
import {Annoucement, AnnoucementSchema } from '../schema/announcement.ts'
import { Bson } from "https://deno.land/x/mongo@v0.31.0/mod.ts";
// import { User } from "../schema/user";

export class AdminController {

    private signIn = async (context: RouterContext<any>) => {
        if (!context.request.hasBody) {
          context.response.status = 400;
          context.response.body = { error: "Invalid data" };
          return;
        }
        const body = context.request.body();
        let _admin: any | undefined;
        if (body.type === "json"){
            _admin = await body.value;
        } else if (body.type === "form-data"){
            const formData = await body.value.read();
            _admin = formData.fields;
        }
        const task1 = await Admin.findOne({
            username: _admin.username
        });

        if (task1){
            const ph = task1.pwdHash;
            let expires = (Date.now() / 1000) + 60 * 30
            let nbf = Date.now() / 1000
            const payload = {
                id: task1.admin_id,
                username: task1.username,
                isAdmin: true
            };
            const adm = await comparePwd(_admin.password, ph);
            if (adm !== false){
                const jwt = await create({ alg: "HS512", typ: "JWT", exp: expires, nbf: nbf }, { payload }, key)
                if (jwt) {
                    context.cookies.set('jwt', jwt, {httpOnly: true})
                    context.response.status = 200;
                    context.response.body = {
                      admin: task1,
                      token: jwt,
                    }
                  } else {
                    context.response.status = 500;
                    context.response.body = {
                      error: "internal server error"
                    }
                  }
                }
                context.response.status = 400;
                context.response.body = {error: `Password does not match`}
            }
            context.response.status = 400;
            context.response.body = {error: `Username does not match`};
    }

    /**
     * newAdmin
     */
    private newAdmin = async (context: RouterContext<"/admin/new">) => {
        if (!context.request.hasBody) {
            context.response.status = 400;
            context.response.body = { error: "Invalid data" };
            return;
        }
        const body = context.request.body();
        let _admin: any | undefined;
        if (body.type === "json") {
            _admin = await body.value;
        } else if (body.type === "form-data") {
            const formData = await body.value.read();
            _admin = formData.fields;
        }
        const ur = await Admin.findOne({
            username: _admin.username
        });

        const task = {
            admin_id: _admin.id || new ObjectId(),
            photo: _admin.photo,
            username: _admin.username,
            fullname:_admin.fullname,
            phone_no: _admin.phone_no,
            email: _admin.email,
            pwdHash: _admin.pwdHash,
            createdBy: _admin.createdBy,
            createdAt: _admin.createdAt || new Date(),
        };

        if (ur){
            context.response.status = 400;
            context.response.body = { error: `Username already exist!`}
        } else{
            const insertedAdmin = await Admin.insertOne(task);
            context.response.status = 200;
            context.response.body = { admin: insertedAdmin};
        }
    }


    /**
     * getAdmin
     */
    public currentAdmin= async ({response,request,cookies}: RouterContext<any>) => {
        if (!request.hasBody){
            try {
                const jwt = await cookies.get('jwt') || '' || null;
                if (!jwt) {
                    response.body = 401;
                    response.body = {
                    error: 'unauthenticated'
                    };
                    return;
                }
                const payload: any = await verify(jwt,key);
                if (!payload) {
                    response.body = 401;
                    response.body = {
                    error: 'unauthenticated'
                    };
                    return;
                }
                let uid = new Bson.ObjectId(payload.id) || ObjectId || undefined;
                const {...adminData} = await Admin.findOne({ admin_id: uid});
                if (adminData) {
                    response.body = 200;
                    response.body = adminData;
                    return;
                }else {
                    response.body = 404;
                    response.body = {error: `Admin data not found`};
                    return;
                }
            } catch (error) {
                response.status = 400;
                response.body = { error: "Invalid data" };
            }
            return;
        }

        const body = request.body();
        let _admin: any | undefined;
        if (body.type === "json") {
            _admin = await body.value;
        } else if (body.type === "form-data"){
            const formData = await body.value.read();
            _admin = formData.fields;
        }
        const adm = await Admin.findOne({
            username: _admin.username
        });
        if (adm) {
            response.status = 200;
            response.body = {admin: adm};
        } else {
            response.status = 404;
            response.body = { error: "No admin data found" };
        }
    }

    /**
     * newAnnoucement
     */
    public newAnnoucement = async ({request,response}: RouterContext<any>) => {
        if (!request.hasBody) {
          response.status = 400;
          response.body = { error: "Invalid data" };
          return;
        }
        const body = request.body();
        let _new: any | undefined;
        if (body.type === "json") {
            _new = await body.value;
        } else if (body.type === "form-data") {
            const formData = await body.value.read();
            _new = formData.fields;
        }

        const ur = await Annoucement.findOne({
            title: _new.title
        });

        const na = {
            ann_id: new ObjectId(),
            title: _new.title,
            body: _new.body,
            photo: _new.photo || {},
            createdBy: _new.createdBy || '',
            createdAt: new Date()
        }

        if (ur) {
            response.status = 400;
            response.body = { error: `Title already exist!`}
        }else {
            const insertedAnn = await Annoucement.insertOne(na);
            if (insertedAnn) {
                response.status = 200;
                response.body = { announcement: insertedAnn}
                return;
            }
            response.status = 400;
            response.body = { error: `Internal server error`}
        }
    }

    /**
     * getAnnouncement
     */
    public getAnnouncements= async ({response}: RouterContext<any>) => {
        const res = Annoucement.find().toArray();
        const announcements = await res;
        if (announcements) {
            response.status = 200
            response.body = announcements
            return;
        }else{
            response.status = 404
            response.body = {error: `No announcement found`}
            return;
        }

        
    }

//     public newAdmin = async (context: RouterContext<"/admin/new">) => {
//         if (!request.hasBody) {
//           context.response.status = 400;
//           context.response.body = { error: "Invalid data" };
//           return;
//         }
//         const body = context.request.body();
//         let _admin: any | undefined;
//         if (body.type === "json") {
//           _admin = await body.value;
//         } else if (body.type === "form-data") {
//           const formData = await body.value.read();
//           _admin = formData.fields;
//         }
  
//         const adm = await Admin.findOne({
//           username: _admin.username
//         })
//         const task = {
//           admin_id: new ObjectId(),
//           photo: _admin.photo,
//           username:_admin.username,
//           fullname: _admin.fullname,
//           phone_no: _admin.phone_no,
//           email: _admin.email,
//           pwdHash: _admin.pwdHash,
//           createdBy: _admin.createdBy,
//           createdAt: new Date()
//         }
  
//         if (adm) {
//           context.response.status = 400;
//           context.response.body = { error: `Username already exist!`}
//         } else {
//           const newInput = await Admin.insertOne(task);
//           context.response.status = 200;
//           context.response.body = { admin: newInput };
//         }
//     }
// }

}
