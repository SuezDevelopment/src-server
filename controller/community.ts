import { isWebSocketCloseEvent, WebSocket } from "https://deno.land/std@0.92.0/ws/mod.ts";
import { RouterContext, ObjectId, getQuery, WebSocketClient, StandardWebSocketClient, v4 } from "../deps.ts";
import {channelEvents, Community} from '../schema/community.ts'
import {Message, MessageSchema} from '../schema/message.ts'
import { pt } from "../src/index.ts";

let path: any | undefined

const wb = async () => {
    const endpoint = "ws://127.0.0.1:8080" || `ws://${path}:${pt}`;
    const ws: WebSocketClient = new StandardWebSocketClient(endpoint);
    ws.on("open", function() {
        console.log("ws connected!");
        ws.send("something");
    });
    ws.on("message", function (message: string){
        console.log(message);
    });
}

export class CommunityController {
    /**
     * name
     */
    public newCommunity = async (context: RouterContext<"/community/new">) => {
        if (!context.request.hasBody) {
            context.response.status = 400;
            context.response.body = { error: "Invalid data" };
            return;
        }

        const body = context.request.body();
        let community: any | undefined;
        if (body.type === "json") {
            community = await body.value;
        } else if (body.type === "form-data") {
            const formData = await body.value.read();
            community = formData.fields;
        }
        const ur = await Community.findOne({
            title: community.title
        });

        const task = {
            comm_id: new ObjectId().toString(),
            title: community.title,
            description: community.description,
            photo: community.photo,
            isApproved: community.isApproved,
            membersCount: community.membersCount,
            members: community.members,
            operators:community.operators,
            messages:community.messages,
            createdAt: new Date()
        }
        if (ur){
            context.response.status = 400;
            context.response.body = { error: `Community title already exist!`}
        } else {
            const insertedCommunity = await Community.insertOne(task);
            if (insertedCommunity) {
                const operator_id = community.createdBy;
                await Community.updateOne(
                    { _id: insertedCommunity },
                    {$set: {
                        members: operator_id,
                        operators: operator_id
                    }}
                )
            }
            context.response.status = 200;
            context.response.body = { community: insertedCommunity}
            
        }
    }
    private ws = async(context: RouterContext<"/ws">)=> {
        
    }

    public getCommunityByID = async (context: RouterContext<"/community/:id">) => {
        const co = context.request.url.searchParams;
        getQuery(context, { mergeParams: true });
        let comm_id: any | undefined;
        for (const p in co ){
            comm_id = p[1]
        }
        if (!comm_id) {
            context.response.status = 400;
            context.response.body = { error: "Invalid data" };
            return;
        }
        const task = Community.findOne({
            comm_id: comm_id
        });
        const comm = await task;
        if (comm) {
            context.response.status = 200;
            context.response.body = { community: comm };
        }

    }
    public getCommunities = async (context: RouterContext<"/communities">) => {
        const task = Community.find().toArray()
        const coms = await task
        if (coms) {
            context.response.status = 200;
            context.response.body = { coms: coms };
        } else {
            context.response.status = 404;
            context.response.body = { error: "No Community data found" };
        }
    }
    public newCommunityChat = async (context: RouterContext<"/community/sendchat">) => {
        if (!context.request.hasBody) {
            context.response.status = 400;
            context.response.body = { error: "Invalid data" };
            return;
        }
        const body = context.request.body();
        let _newChat: any | undefined;
        if (body.type === "json") {
            _newChat = await body.value;
        } else if (body.type === "form-data") {
            const formData = await body.value.read();
            _newChat = formData.fields;
        }

        const task = {
            _id: new ObjectId(),
            message: _newChat.message,
            messageType: _newChat.messageType,
            sentBy: _newChat.sentBy,
            comments: _newChat.comments,
            file: _newChat.file,
            isRead: _newChat.isRead,
            messageTime: new  Date()
        };

        const comm_id = _newChat.comm_id;
        const insertMessage = await Message.insertOne(task);

        if (insertMessage) {
            const hs = await Community.updateOne(
                { _id: comm_id },
                { $set: {
                    messages: task._id.toString(),
                }}
            )
            context.response.status = 400;
            context.response.body = { message: hs };

        }
        
    }
    public getCommunityChat = async (context: RouterContext<"/community/chat">) => {
        if (!context.request.hasBody) {
            context.response.status = 400;
            context.response.body = { error: "Invalid data" };
            return;
        }

    }

    /**
     * name
     */
    /**
     * createWs =async
 =>    */
    public createWs =async(context: RouterContext<"/ws">)=> {

        let sockets = new Map<string, WebSocket>();
        // const eventBrodcaster = (obj: channelEvents) => {
        //     sockets.forEach((ws: WebSocket) => {
        //         ws.send(JSON.stringify(obj));
        //     });
        // }
        const connection = async (ws: WebSocket, uid:any) => {
            sockets.set(uid, ws);
            const users = new Map<string, WebSocket>()
            function sendChat(message: any, senderId?: string): void {
                if (!message) return
                for (const user of users.values()) {
                  user.send(senderId ? `[${senderId}]: ${message}` : message)
                }
            }
            async function chat(ws: WebSocket, userId:any): Promise<void> {
                // Register user connection
                users.set(userId, ws)
                sendChat(`> User with the id ${userId} is connected`)
                // Wait for new messages
                for await (const event of ws){
                  const message = typeof event === 'string' ? event : ''
                  sendChat(message, userId)
                  // Unregister user conection
                  if (!message && isWebSocketCloseEvent(event)) {
                    users.delete(userId)
                    sendChat(`> User with the id ${userId} is disconnected`)
                    break
                  }
                }
            }
        }
    }
    
}      
//     /**
//      * name
//      */
    

//     public getMemberCount = async (context: RouterContext<"/auth/signup">) => {
//         if(!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }

//         const task = Community.aggregate([
//             {
//                 $project:{
//                     title: 1,
//                     noOfMembers: {
//                         $cond:{
//                             if: {
//                                 $isArray: "members",
//                                 then: {
//                                     $size: "members"
//                                 },
//                                 else: "NA"
//                             }
//                         }
//                     }
//                 }
//             }
//         ])

//         if (task){
//             res.status = 200;
//             res.body = [
//                 task
//             ];
//         }
//         res.status = 404;
//         res.body = {error: `No member`};
//     }

//     public getUserCommunity = async (context: RouterContext<"/auth/signup">) => {
//         if (!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }
//         const {
//             value: { user_id },
//         } = await req.body();

//         const task = Community.find({ members: {
//             $in:[`${user_id}`]
//         }})

//         if (task) {
//             res.status = 200;
//             res.body = [
//                 task
//             ]
//         }
//         res.status = 404;
//         res.body = {error: `User does not belong in any community`}
//     }

//     /**
//      * name
//      */
//     public userJoinCommunity = async(context: RouterContext<"/auth/signup">) => {
//         if (!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }
//         const {
//             value: { user_id, comm_id },
//         } = await req.body();

//         const task1 = await Community.findOne([
//             { _id: comm_id },
//             {
//                 members: {
//                     $in: [`${user_id}`]
//                 }
//             }
//         ]);

//         const task2 = await Community.updateOne(
//             { _id: comm_id },
//             {$push: {
//                 members: user_id
//             }}
//         )

//         if (!task1) {
//             const mc = task2.modifiedCount;
//             res.status = 200;
//             res.body = `new user(s) added!. Members Count ${mc}`
//         }
//         res.status = 401;
//         res.body = `user already exist in community`;
//     };

//     /**
//      * getCommunityMessage
//      */
//     public getCommunityMessage = async (context: RouterContext<"/auth/signup">) => {
//         if (!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }

//         const {
//             value: { comm_id },
//         } = await req.body()

//         const task = Communiity.findOne({_id: comm_id})
//         if (!task) {
//             res.body = 404;
//             res.body = { error: "Community not found"};
//             return;
//         }
//         const msg = task.then( async(msgs)=>{
//             return msgs;
//         })

//         msg.forEach(element => {
            
//         });
//     }


// }