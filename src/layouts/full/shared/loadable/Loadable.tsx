import { Suspense } from 'react'
import Spinner from '@/components/common/Spinner'

// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<Spinner />}>
    <Component {...props} />
  </Suspense>
)

export default Loadable
