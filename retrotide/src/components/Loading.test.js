import React from 'react';
import { 
  render,
  screen,
  wait,
} from '@testing-library/react';
import {
  MemoryRouter as Router,
} from "react-router-dom";
import renderWithRouter from '../setupTests'
import '@testing-library/jest-dom/extend-expect'
import axios from 'axios'

import Loading from './Loading';

jest.mock('axios');

// this test should be changed and moved to probably the Design page
// Loading is going to load as a modal
// and then the function will redirect on its own
// the redirect won't be part of the modal


// we're doing an async test here so we need a bunch of stuff
// note that the component itself is NOT async, the router is what we're testing
// maybe this should be in a router test file instead?

it('renders loading page', () => {
  render(<Router><Loading /></Router>);
  const loadingMessage = screen.getByText("Loading, please wait");
  expect(loadingMessage).toBeInTheDocument();
});

it('redirects to result page', async () => {
  const props = {
    origin: "jobSubmit",
  }
  const { history } = renderWithRouter(<Router><Loading {...props} /></Router>)

  axios.get.mockImplementation(() =>
    Promise.resolve({
      data: { status: 'fail' },
    })
  )

  await wait(() => {
    expect(axios).toHaveBeenCalled()
  })
  expect(history.location.pathname).toEqual('/results')
});