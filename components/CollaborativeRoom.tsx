"use client"
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import React, { KeyboardEvent, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Loader from './Loader'
import Header from '@/components/Header'
import { Editor } from '@/components/editor/Editor'
import { SignInButton, SignedOut, SignedIn, UserButton } from '@clerk/nextjs'
import ActiveCollaborators from './ActiveCollaborators'
import { useState,useRef } from 'react'
import { Input } from './ui/input'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { updateDocument } from '@/lib/actions/room.actions'
import ShareModal from './ShareModal'
const CollaborativeRoom = ({roomId,roomMetadata,currentUserType,users}:CollaborativeRoomProps) => {
  const [editing,setEditing]=useState<boolean>(false)
  const[loading,setLoading]=useState(false)
  const [documenTitle,setDocumentTitle]=useState(roomMetadata.title)
  //const currentUserType='editor'
  const containerRef=useRef<HTMLDivElement>(null)
  const inputRef=useRef<HTMLInputElement>(null)
  const updateTitleHandler=async(e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==='Enter'){
     
      setLoading(true)
      try{
        if(documenTitle!==roomMetadata.title){
          const updatedDocument=await updateDocument(roomId,documenTitle);
          if(updatedDocument){
      //       se
      setEditing(false)    
    }
        }
      }
      catch(error){
        console.log(error)
      }
  }
  setLoading(false)
}
  useEffect(()=>{
    const handleClickOutside=(e:MouseEvent)=>{
      if(containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false)
      }
      updateDocument(roomId,documenTitle)
    }
    document.addEventListener('mousedown', handleClickOutside);
  },[roomId,documenTitle])
  useEffect(()=>{
    if(editing && inputRef.current)
      inputRef.current.focus()
  },[editing])
  return (
    <RoomProvider id={roomId} initialPresence={{}}>
      <ClientSideSuspense fallback={<Loader />}>
        {() => (
          <div className='collaborative-room'>
            <Header>

              <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
               {
                editing && !loading?(
                <Input
                type="text" value={documenTitle} ref={inputRef} placeholder='Enter title' onChange={(e)=> setDocumentTitle(e.target.value)}
                onKeyDown={updateTitleHandler} disabled={!editing} className='document-title-input'
                />):(<><p className='document-title'>{documenTitle}</p></>)
               }
               {currentUserType=='editor' && !editing && (
                <Image src="/assets/icons/edit.svg" alt="edit" width={24} height={24} onClick={()=>setEditing(true)} className='pointer'/>
               )}
               {currentUserType!='editor' && !editing && (
                <p className='view-only-tag'>View only</p>
               )}
               {
                loading && <p className='text-sm text-gray-400'>saving...</p>
               }
              </div>
              <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
                <ActiveCollaborators/>
                <ShareModal roomId={roomId} collaborators={users} creatorId={roomMetadata.creatorId} currentUserType={currentUserType}/>
                <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              </div>
            </Header>
            <Editor roomId={roomId} currentUserType={currentUserType}/>
          </div>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom