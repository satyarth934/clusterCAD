import React from 'react';

// the loading "page" is just a modal and doesn't do the redirect itself
// to find the redirect logic check the button that summons this modal

function Loading(props) {

  return (
    <div>
      <div className='modal-mask'></div>
      <div className='loading-modal'>"Loading, please wait"</div>
    </div>
  )
}

export default Loading;