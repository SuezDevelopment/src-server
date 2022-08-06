import {ObjectId, create, verify, Bson} from '../deps.ts'
import {comparePwd} from '../utils/hashPwd.ts'
import {logger} from '../utils/logger.ts'
import {key} from '../utils/apiKey.ts'
import { User, UserSchema } from '../schema/user.ts'
import { RouterContext } from "../deps.ts";

export class UserController {
    /**
   * Create a User
   *
   * @name User Create
   * @route {POST} /createuser
   * @bodyparam {String} first_name
   * @bodyparam {String} last_name
   * @bodyparam {String} email
   *
   */

    public createUser = async (context: RouterContext<any>) => {
      if (!context.request.hasBody) {
        context.response.status = 400;
        context.response.body = { error: "Invalid data" };
        return;
      }
      const body = context.request.body();
      let user: any | undefined;
      if (body.type === "json") {
        user = await body.value;
      } else if (body.type === "form-data") {
        const formData = await body.value.read();
        user = formData.fields;
      }
      const ur = await User.findOne({
        username: user.username
      });

      const task = {
        user_id: new ObjectId(),
        fullname: user.fullName,
        username: user.username,
        depertment: user.depertment,
        email: user.email,
        pwdHash: user.pwdHash,
        bio: user.bio,
        communities: user.communities,
        status: user.status,
        isOperator: false,
        photo: user.photo,
        phone_no: user.phone_no,
        hasVoted: false,
        createdAt: new Date(),
      };
      if (ur){
        context.response.status = 400;
        context.response.body = { error: `Username already exist!`}
      } else {
        const insertedUser = await User.insertOne(task);
        context.response.status = 200;
        context.response.body = {user: insertedUser}
      }

      // context.response.status = 401;
      // context.response.body = {error: 'Username already exist'};
    };

    /**
     * getUsers
     */
    public getUsers= async (context: RouterContext<"/users">) => {
      const request =  User.find().toArray()
      const usrs = await request;
      if (usrs) {
        context.response.status = 200;
        context.response.body = usrs;
      } else {
        context.response.status = 404;
        context.response.body = { error: "No user data found" };
      }
     
      // context.response.status = 404;
      // context.response.body = { error: `no user found`}
    }

    /**
     * name
     */
    public signInUser= async (context: RouterContext<"/auth/signin">) => {
      if (!context.request.hasBody) {
        context.response.status = 400,
        context.response.body = { error: "Invalid data" }
        return
      }
      const body = context.request.body();
      let _sd: any | undefined;
      if (body.type === "json") {
          _sd = await body.value;
      } else if (body.type === "form-data") {
          const formData = await body.value.read();
          _sd = formData.fields;
      }

      const task1 = await User.findOne({
        username: _sd.username
      });

      if (task1) {
        const ph = task1.pwdHash
        const com = await comparePwd(_sd.password, ph);
        if (com !== false) {
          const payload = {
            id: task1.user_id,
            username: task1.username
          };
          const jwt = await create({ alg: "HS512", typ: "JWT" }, { payload }, key)
          if (jwt) {
            context.cookies.set('jwt', jwt, {httpOnly: true})
            context.response.status = 200;
            context.response.body = {
              user: task1,
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
      context.response.body = {error: `Username does not match`}
    }

    /**
     * currentUser
     */
    public currentUser = async({response, cookies}: RouterContext<any>)=> {
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
      const {...userData} = await User.findOne({ user_id: uid});
      if (userData) {
        response.body = 200;
        response.body = userData;
        return;
      }else {
        response.body = 404;
        response.body = {error: `User data not found`};
        return;
      }
    }


    public Logout = async ({response, cookies}: RouterContext<any>) => {
      const d = cookies.delete('jwt');
      if (d) {
        response.status = 200
        response.body = `User has been logout!`
      }
      response.status = 401
      response.body = `Unable to logout user!`
    }
  

    /**
     * newAdmin 
     */
    


    /**
   * Get user by Id
   *
   * @name User get by Id
   * @route {GET} /getuser/:id
   * @queryparam {String} id
   *
   */

   checkLength = async(params:any) =>{
      if (params.trim().length < 24) {
        return false;
      } else if (params.trim().length >= 20){
        return true;
      }
      return null
   }

    static checkOid = (oid: string) => {
      return new RegExp("^[0-9a-fA-F]{24}$").test(oid);
    };
    public getUser = async (context: RouterContext<"/user/:id">) => {
      let _user: any | undefined;
      const mtd = context.request.method;
      const url = context.request.url;
      if (mtd.toString() == 'get'||'GET'){
        let path: any | null;
        path = url.pathname.match(/\/(\d+)\b(?!.*\/(\d+)\b)/);
        let user_id, username, _usr : any | undefined;
        if (await this.checkLength(path[1]) == true){
          return user_id = path[1];
        }else if (await this.checkLength(path[1]) !== true) {
          return username = path[1];
        }
        if (username) {
          return _usr =  await User.findOne({
            username: username
          })
        } else if (user_id) {
          return _usr =  await User.findOne({
            user_id: user_id
          })
        }
        if (_usr) {
          context.response.status = 200;
          context.response.body = {user: _usr };
        } else {
          context.response.status = 404;
          context.response.body = { error: "User not found" };
          return;
        }
        
      } else if (mtd.toString() == 'post'||'POST') {
        if (!context.request.hasBody){
          context.response.status = 400;
          context.response.body = { error: "Invalid data" };
          return;
        }
        const body = context.request.body();
        if (body.type === "json") {
          _user = await body.value;
        } else if (body.type === "form-data") {
          const formData = await body.value.read();
          _user = formData.fields;
        }
        let _usr: any;
        if (_user.username) {
          return _usr =  await User.findOne({
            username: _user.username
          })
        } else if (_user.user_id) {
          return _usr =  await User.findOne({
            user_id: _user.user_id
          })
        }
        if (_usr) {
          context.response.status = 200;
          context.response.body = {user: _usr };
        } else {
          context.response.status = 404;
          context.response.body = { error: "User not found" };
          return;
        }

      }
    };
    
     /**
   * Update User by Id
   *
   * @name User Update
   * @route {PUT} /updateuser/:id
   * @bodyparam {String} first_name
   * @bodyparam {String} last_name
   * @bodyparam {String} email
   * @queryparam {String} id
   *
   */
    public updateUserById = async ({request,response}: RouterContext<any>) => {
      const url = request.url.pathname;
      let path: any | undefined,user_id, _user: UserSchema | any
      if(!request.hasBody) {
        response.body = 401;
        response.body = {
          error: 'Invalid data'
        };
        return null
      };
      const { value:{
        ...data
      }} = request.body();
      path = url.match(/\/(\d+)\b(?!.*\/(\d+)\b)/);
      if (path[1]) {
        return user_id = path[1] || undefined;
      }
      if (user_id) {
        return _user = await User.findOne({
          user_id: user_id,
        });
      }
      if (_user){
        const update = await User.updateOne(
          {"user_id": user_id},
          {$set: {...data}},
          {upsert: true}
        );
        if (update) {
          response.status = 200;
          response.body =  `User data updated ID: ${update.upsertedId}`;
          return
          // response.redirect()
        };
        response.status = 400;
        response.body = {error: `User data not updated`}
      }else{
        response.status = 404;
        response.body = {error: `User with ID: ${user_id} not found`}
        return;
      }
        
    }
};

    /**
     * getUserCommunity 
     */
    // public getUserCommunity = async (req:any,res:any) => {
    //   function containsObject(obj:any, list:any) {
    //     var i;
    //     for (i = 0; i < list.length; i++) {
    //         if (list[i] === obj) {
    //             return true;
    //         }
    //     }
    //     return false;
    //   }
    // }

  /**
   * Delete User by Id
   *
   * @name User Delete
   * @route {DELETE} /deleteuser/:id
   * @queryparam {String} id
   *
   */
    // public deleteUserById = async (ctx: RouterContext) => {
    //     if (ctx.params && ctx.params.id) {
    //         const user = await User.findOne({
    //         _id: {
    //             $oid: ctx.params.id,
    //         },
    //         });
    //         if (user) {
    //         await User.deleteOne({
    //             _id: {
    //             $oid: ctx.params.id,
    //             },
    //         });
    //         ctx.response.status = 200;
    //         ctx.response.body = { message: "Deleted Successfully" };
    //         } else {
    //         logger.info(
    //           "No User found for the given Id {Id}",
    //           ctx.params.id
    //         );
    //         ctx.throw(404, `No User found for the given Id ${ctx.params.id}`);
    //       }
    //   }
  // };
