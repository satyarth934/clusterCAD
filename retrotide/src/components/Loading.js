import React from 'react';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

// navigation link with some logic idenitfying active tab

function Loading(props) {

  return (
    <div>"Loading, please wait"</div>
  )
}

export default withRouter(Loading);