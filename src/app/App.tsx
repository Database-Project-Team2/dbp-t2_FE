import { StoreProvider } from '../store/StoreProvider'
import { Workspace } from './layout/Workspace'

export default function App() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  )
}
