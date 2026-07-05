import React from 'react'

const MessageSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 p-4 animate-pulse">
        {/* Assistant skeleton */}
        <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="h-3 w-48 rounded bg-muted" />
        <div className="h-3 w-72 rounded bg-muted" />
        <div className="h-3 w-60 rounded bg-muted" />
        </div>
        {/* User skeleton */}
        <div className="flex flex-col gap-2 max-w-[60%] ml-auto">
        <div className="h-3 w-40 rounded bg-muted" />
        <div className="h-3 w-52 rounded bg-muted" />
        </div>
        {/* Assistant skeleton */}
        <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="h-3 w-56 rounded bg-muted" />
        <div className="h-3 w-80 rounded bg-muted" />
        <div className="h-3 w-44 rounded bg-muted" />
        <div className="h-3 w-64 rounded bg-muted" />
        </div>
    </div>
  )
}


export default MessageSkeleton