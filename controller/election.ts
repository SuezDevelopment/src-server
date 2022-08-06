// import { ObjectId } from '../deps.ts';
// import { newCandidate, Candidate } from '../schema/candidate.ts'
// import { Election, newElection, election, Elections } from '../schema/election.ts'

// export class ElectionController {

//     public newElection = async (req:any,res:any) => {
//         if (!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }

//         const {
//             value: { title, endedAt, candidates },
//         } = await req.body();
        
//         const task = newElection(
//             title, endedAt, candidates
//         )
//         const nw = await Election.insertOne(task)
//         res.status = 201;
//         res.body = {
//             election: {
//                 id: nw.id,
//                 ...task
//             }
//         }
//     }



//     public addCandidate = async (req:any,res:any) => {

//         if (!req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }

//         const {
//             value: { 
//                 fullname,
//                 cand_id,
//                 position,
//                 bio,
//                 department,
//                 mat_no,
//              },
//         } = await req.body();

//         const task = newCandidate (
//             fullname,
//             cand_id,
//             position,
//             bio,
//             department,
//             mat_no,
//         );
//         const nw = Candidate.insertOne(task)
//     }

//     /**
//      * name
//      */
//     public getElection = async(
//         res:any
//     ) => {
//         const request = Election.find();

//         const task = request.map(
//             ({ _id, title, isInprogress,endedAt,candidates  }:Elections) => {
//               return { _id, title, isInprogress,endedAt,candidates };
//             }
//         );
//         res.status = 200;
//         res.body = { task };
//     }
//     static checkOid = (oid: string) => {
//         return new RegExp("^[0-9a-fA-F]{24}$").test(oid);
//     };
      

//     public toggleElection = async (req:any,res:any, params:{ id?:ObjectId}) => {
//         const { id } = params;
//         if (!id || ElectionController.checkOid(id.toString()) || !req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid data" };
//             return;
//         }

//         const task = await Election.findOne({ _id: id });

//         if (!task) {
//             res.body = 404;
//             res.body = { error: "Election not found" };
//             return;
//         }
//         const {
//             value: { isInprogress, endedAt, candidates },
//         } = await req.body();

//         await Election.updateOne(
//             {_id: id},
//             {$set: {
//                 isInprogress: isInprogress, endedAt:endedAt, candidates: candidates
//             }}
//         );
//         res.status = 201;
//     }

//     /**
//      * userVote
//      */
//     public userVote = async (req:any,res:any, params:{ id?:ObjectId}) => {

//         function containsObject(obj:any, list:any) {
//             var i;
//             for (i = 0; i < list.length; i++) {
//                 if (list[i] === obj) {
//                     return true;
//                 }
//             }
//             return false;
//         }
//         const { id } = params;
//         if (!id || ElectionController.checkOid(id.toString()) || !req.hasBody) {
//             res.status = 400;
//             res.body = { error: "Invalid" };
//             return;
//         };
//         const task = Candidate.findOne({_id: id});
//         if (!task) {
//             res.body = 404;
//             res.body = { error: "Candidate not found"};
//             return;
//         }
//         let vtrs: any = [

//         ];

//         const nw = task.then( async(candidate) => {
//             vtrs = candidate?.voters
//             return candidate?.voters
//         });
//         const {value: {user_id,},} = await req.body()
//         if (containsObject(user_id, nw || vtrs) == false){
//             vtrs.push(user_id)
//             const ul = vtrs.length
//             await Candidate.updateOne(
//                 {_id: id},
//                 { $push: {
//                     voters: user_id 
//                 }}
//             )

//             const voteCount = Candidate.aggregate([
//                 {
//                     $project: {
//                       totalVotes: {
//                         $size: "$voters"
//                       }
//                     }
//                 }
//             ]);

//             res.status = 200
//             res.body = { candidate: {
//                 vCount: voteCount
//             }}
//         } else {
//             res.status = 400
//             res.body = { error:'Voter already exist'}
//         };
//     } 
// }

// export const ec = new ElectionController;
