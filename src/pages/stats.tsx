import dynamic from 'next/dynamic'
const Statistics = dynamic(
  () => import('../components/statistics/Statistics').then((mod: any) => mod.Statistics),
  { ssr: false },
)

export const page = () => <Statistics />
export default page
