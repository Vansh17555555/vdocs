"use client"
import React from 'react'
import { cn } from '@/lib/utils'
import { useIsThreadActive } from '@liveblocks/react-lexical'
import { Composer, Thread } from '@liveblocks/react-ui'
import { useThreads } from '@liveblocks/react/suspense'

interface ThreadWrapperProps {
  thread: any; // Replace 'any' with the correct type from your Liveblocks types
}

const ThreadWrapper: React.FC<ThreadWrapperProps> = ({ thread }) => {
  const isActive = useIsThreadActive(thread.id);
  
  return (
    <Thread 
      thread={thread} 
      data-state={isActive ? 'active' : undefined}
      className={cn(
        'comment-thread border',
        isActive && 'border-blue-500 shadow-md',
        thread.resolved && 'opacity-40'
      )}
    />
  )
}

const Comments: React.FC = () => {
  const { threads } = useThreads()
  
  return (
    <div className='comments-container'>
      <Composer className='comment-composer' />
      {threads.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  )
}

export default Comments