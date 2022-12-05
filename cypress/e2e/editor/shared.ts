export const getTitleInput = () => cy.get('#title')
export const getHtmlEditor = () => cy.get('.ProseMirror')
export const getMdEditor = () => cy.get('.CodeMirror-code')
export const getCanonicalInput = () => cy.get('#canonical')
export const getTagsInput = () => cy.contains('Tags').parent().parent().find('.ant-select-selector')
export const getPublishButton = () => cy.contains('Publish')
export const getEditorSwitchMode = () =>
  cy.contains('Markdown Mode:').parent().parent().find('.ant-switch')

export const getTabCoverImage = () => cy.contains('Cover Image')
export const getTabVideo = () => cy.contains('Video')
export const getCoverImageContent = () => cy.contains('Drag & drop here or click to upload')
export const getVideoContent = () => cy.contains('Video URL:')

export const sampleEditorText = {
  title: 'Test Editor',
  typed:
    '**Test Heading**\n\n1. number 1\nnumber 2\ntest link <https://google.com>\ntest usual link [google](https://google.com)',
  htmlLines: [
    'Test Heading',
    'number 1',
    'number 2',
    'test link https://google.com',
    'test usual link google',
  ],
  mdLines: [
    '**Test Heading**',
    'number 1',
    'number 2',
    'test link <https://google.com>',
    'test usual link [google](https://google.com)',
  ],
}
export const assertEditorText = () => {
  const { mdLines, htmlLines, title } = sampleEditorText
  getTitleInput().should('contain.value', title)

  getEditorSwitchMode().click()
  getEditorSwitchMode().click()
  getEditorSwitchMode().click()
  getEditorSwitchMode().click()

  mdLines.forEach(line => {
    if (line) cy.contains(line)
  })

  getEditorSwitchMode().click()
  htmlLines.forEach(line => {
    if (line) cy.contains(line)
  })
}
