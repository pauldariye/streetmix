/* eslint-env jest */
import React from 'react'
import StreetMetaAuthor from '../StreetMetaAuthor'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { showGallery } from '../../store/actions/gallery'
import { fireEvent } from '@testing-library/react'

// Enable mocking of the return value of `isOwnedByCurrentUser`
jest.mock('../../streets/owner')

jest.mock('../../store/actions/gallery', () => ({
  showGallery: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('StreetMetaAuthor', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    showGallery.mockClear()
  })

  it('renders nothing if you own the street', () => {
    const { container } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: 'foo'
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'foo'
          }
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })

  it('renders street creator byline if you are signed in and it’s not yours', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: 'foo'
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'bar'
          }
        }
      }
    })

    fireEvent.click(getByText('foo'))
    expect(showGallery).toBeCalledTimes(1)
    expect(showGallery).toBeCalledWith('foo')
  })

  it('renders street creator byline if you are not signed in', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: 'foo'
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    fireEvent.click(getByText('foo'))
    expect(showGallery).toBeCalledTimes(1)
    expect(showGallery).toBeCalledWith('foo')
  })

  it('renders anonymous byline if you are signed in', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: null
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'bar'
          }
        }
      }
    })

    expect(getByText('by Anonymous')).toBeInTheDocument()
  })

  it('renders anonymous byline if you are not logged in and viewing an anonymous street', () => {
    isOwnedByCurrentUser.mockImplementationOnce(() => false)
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: null
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    expect(getByText('by Anonymous')).toBeInTheDocument()
  })

  it('renders nothing if you are a not-logged in user still editing an anonymous street', () => {
    isOwnedByCurrentUser.mockImplementationOnce(() => true)
    const { container } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creator_id: null
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })
})
