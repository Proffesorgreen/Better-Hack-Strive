import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
const client = new MongoClient("mongodb://ethio-guide:G82W8klR95riD7BT@ac-hdiqau3-shard-00-00.ggdpooh.mongodb.net:27017,ac-hdiqau3-shard-00-01.ggdpooh.mongodb.net:27017,ac-hdiqau3-shard-00-02.ggdpooh.mongodb.net:27017/?ssl=true&replicaSet=atlas-xjj6s0-shard-0&authSource=admin&retryWrites=true&w=majority&appName=EthioGuideCluster");
const db = client.db();
import { jwt } from "better-auth/plugins"; 

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client
    }),
        emailAndPassword: { 
        enabled: true, 
    }, 
        socialProviders: { 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [jwt(), nextCookies()],
});