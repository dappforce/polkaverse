import dynamic from 'next/dynamic'
const EditPost = dynamic(import('src/components/posts/editor'), { ssr: false })

export default EditPost
