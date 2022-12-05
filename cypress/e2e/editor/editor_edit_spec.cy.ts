import { assertEditorText, getEditorSwitchMode } from './shared'

describe('editor for edit post', () => {
  beforeEach(() => {
    cy.login()
    const mySpace = Cypress.env('my_space')
    const myPost = Cypress.env('my_post')
    cy.visitAndWaitStartup({ url: `/${mySpace}/${myPost}/edit` })
  })

  it('should have correct title and body data', () => {
    getEditorSwitchMode().click()
    assertEditorText()
  })
})
