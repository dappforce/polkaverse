import {
  assertEditorText,
  getCanonicalInput,
  getCoverImageContent,
  getEditorSwitchMode,
  getHtmlEditor,
  getMdEditor,
  getPublishButton,
  getTabCoverImage,
  getTabVideo,
  getTagsInput,
  getTitleInput,
  getVideoContent,
  sampleEditorText,
} from './shared'

describe('editor for new post', () => {
  beforeEach(() => {
    cy.login()
    const mySpace = Cypress.env('my_space')
    cy.visitAndWaitStartup({ url: `/${mySpace}/posts/new` })
  })

  it('should render correct form elements', () => {
    getTitleInput().should('be.visible')
    getHtmlEditor().should('be.visible')
    getCanonicalInput().should('be.visible')
    getTagsInput().should('be.visible')
    getPublishButton().should('be.visible')
  })

  context('tests video and image tab', () => {
    it('should render selected tab contents', () => {
      getCoverImageContent().should('exist')
      getTabVideo().click()

      getCoverImageContent().should('not.exist')
      getVideoContent().should('exist')

      getTabCoverImage().click()

      getCoverImageContent().should('exist')
      getVideoContent().should('not.exist')
    })
  })

  context('tests title input', () => {
    it('should be empty', () => {
      getTitleInput().should('be.empty')
    })
    it('should render error message accordingly', () => {
      const title = getTitleInput()
      const getError = () => cy.contains('Post title is too short')

      title.type('as')
      getError().should('not.exist')
      title.blur()
      getError().should('exist')
      title.type('a').blur()
      getError().should('not.exist')
    })
  })

  context('tests body editor', () => {
    it('can be typed', () => {
      getHtmlEditor().type('asdf')
      cy.contains('asdf')
    })

    it('saves body content as draft', () => {
      getHtmlEditor().type('asdf')
      cy.contains('asdf')
      cy.wait(250)

      cy.reload()

      cy.contains('asdf')
    })
  })

  context('tests editor mode switching', () => {
    it('should have same content when switching from different editor modes', () => {
      getEditorSwitchMode().click()
      const { typed, title } = sampleEditorText
      getTitleInput().type(title)
      getMdEditor().type(typed)

      assertEditorText()
    })
  })

  it('should display correct editor based on last used', () => {
    getHtmlEditor().should('be.visible')
    getEditorSwitchMode().click()

    getMdEditor().should('be.visible')
    cy.reload()
    getMdEditor().should('be.visible')

    getEditorSwitchMode().click()
    getHtmlEditor().should('be.visible')
    cy.reload()
    getHtmlEditor().should('be.visible')
  })
})
