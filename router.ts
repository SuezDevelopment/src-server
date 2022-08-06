import { Router } from "./deps.ts";
import {UserController} from './controller/user.ts'
// import {ElectionController} from '../../controller/election.ts'
import {CommunityController} from './controller/community.ts'
import { authourized } from "./middleware/isAuth.ts";
import { AdminController } from "./controller/admin.ts";

const router = new Router();
const us = new UserController
// const ec = new ElectionController
const cc = new CommunityController
const ac = new AdminController



const signIn = us.signInUser
const signUp = us.createUser
const getUsers = us.getUsers
const getUser = us.getUser
const currentUser = us.currentUser
const updateUserById = us.updateUserById
// const getUserById = us.getUserById


//Election controllers
// const newElection = ec.newElection
// const addCandidate = ec.addCandidate
// const getElection = ec.getElection
// const toggleElection = ec.toggleElection
// const userVote = ec.userVote

//Communiity Controllers
const newCommunity = cc.newCommunity
const getCommunity = cc.getCommunities
const getCommunityByID = cc.getCommunityByID
// const getMemberCount = cc.getMemberCount
const newCommunityChat = cc.newCommunityChat
const ws = cc.createWs
// const getUserCommunity = cc.getUserCommunity
// const userJoinCommunity = cc.userJoinCommunity

// User routes
router
    .POST("/auth/signin", signIn)
    .POST("/auth/signup", signUp)
    .GET("/users",  getUsers)
    .POST("/user/:id",  getUser)
    .PUT("/user/update",  updateUserById)
    .GET("/user/:id",  getUser)
    .GET('/user', currentUser)
    .GET('/user/announcements', currentUser)


router
    .POST("/community/new", newCommunity)
    .POST("/community/:id", getCommunityByID)
    .GET("/communities", getCommunity)
    .POST("/community/sendchat", newCommunityChat)
    .POST("/ws", ws)
    .GET('/', (context: { response: { body: string; }; }) => {
        context.response.body = 'Server is listerning on 3000';
    });


    //admin requests
router
    .POST()

// router
//     .GET("user/:username",authourized, getUserByusername)
//     .patch("user/:id",authourized, updateUserById)
   
export default router
