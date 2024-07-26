"use server"
import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { RoomAccesses as LiveblocksRoomAccesses } from '@liveblocks/node';
import { redirect } from "next/navigation";

// Define the type for the document creation parameters
interface CreateDocumentParams {
  userId: string;
  email: string;
}

// Define the createDocument function
export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();
  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: LiveblocksRoomAccesses = {
      [email]: ['room:write'],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });

    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.log(error);
  }
};

// Define the getDocument function
export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
  const room = await liveblocks.getRoom(roomId);
  const hasAccess = Object.keys(room.usersAccesses).includes(userId) 

  if (!hasAccess) {
    throw new Error("you do not have access to this document");
  }

  return parseStringify(room);
};

// Define the updateDocument function
export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(error);
  }
};
export const getDocuments = async (email: string) => {
  const rooms = await liveblocks.getRooms({userId:email});
  

  return parseStringify(rooms);
};
export const updateDocumentAccess=async({roomId,email,userType,updatedBy}:ShareDocumentParams)=>{
  try {
    const usersAccesses:RoomAccesses={
      [email]:getAccessType(userType) as AccessType

    }
    const room=await liveblocks.updateRoom(roomId,{
      usersAccesses,
    })
    if (room){
      const notificationId=nanoid()
      await liveblocks.triggerInboxNotification({
        userId:email,
        kind:'$documentAccess',
        subjectId:notificationId,
        activityData:{
          userType,
          title:"great",
          updatedBy:updatedBy.name,
          avator:updatedBy.avator,
          email:updatedBy.email
        },
        roomId,
      })
    }
    revalidatePath(`/documents/${roomId}`)
    return parseStringify(room)
  }
  catch(error){
    console.log(error)
  }
}
export const removeCollaborator=async({roomId,email}:{roomId:string,email:string})=>{
  try {
    const room=await liveblocks.getRoom(roomId)
    if (room.metadata.email===email){
      throw new Error('owner cant be removed')
  }
  const updatedRoom=await liveblocks.updateRoom(roomId,{
    usersAccesses:{
      [email]:null
  }
  })
}
  catch(error){
    console.log(error)
  }
}
export const deleteDocuments=async(roomId:string)=>{
  try {
    await liveblocks.deleteRoom(roomId)
   
      revalidatePath(`/`)
      redirect('/')
  }
  catch(error){
    console.log(error)
  }
}