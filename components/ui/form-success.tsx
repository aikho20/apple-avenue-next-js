import React from 'react'
import { FaRegCheckCircle } from "react-icons/fa";
interface FormSuccessProps {
    message: String
}

function FormSuccess({ message }: FormSuccessProps) {
    if (!message) return null
    return (
        <div className='bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-emerald-500'>
            <FaRegCheckCircle className='h-4 w-4' />
            <p className='text-sm'>{message}</p>
        </div>
    )
}

export default FormSuccess