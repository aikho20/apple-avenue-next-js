import React from 'react'

function UnAuthorized() {
    return (
        <div className='h-100 w-100 flex flex-col justify-center align-center'>
            <div className='flex flex-col justify-center align-center'>
                <p className='text-3xl text-center text-semibold p-3'>UnAuthorized</p>
                <p className='text-sm text-center'>You dont have permission to access this page, Please contact us to get access.</p>
            </div>
        </div>
    )
}

export default UnAuthorized