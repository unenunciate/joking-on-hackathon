import * as React from 'react'
import {
  ChakraProvider,
} from '@chakra-ui/react'
import { Global } from '@emotion/react'
import globalStyles from './globalStyles'
import { BrowserRouter as Router } from 'react-router-dom'
import theme from './theme'
import AppRoutes from './AppRoutes'
import ScrollToTop from 'modules/common/ScrollToTop'
import PostHogPageView from 'modules/common/PostHogPageView'

import { AuthProvider } from 'features/users/AuthProvider'
import { CaptureProvider } from 'features/capture/CaptureProvider'

import { PolybaseProvider } from '@polybase/react'
import POLYBASE from 'config/polybase'


export const App = () => {
  return (
    <PolybaseProvider polybase={POLYBASE}>
      <AuthProvider
        domain={process.env.REACT_APP_DOMAIN}
        storagePrefix={process.env.REACT_APP_AUTH_STORAGE_PREFIX}
      >
        <CaptureProvider>
          <ChakraProvider theme={theme}>
            <Global styles={[globalStyles]} />
            <Router>
              <PostHogPageView />
              <ScrollToTop />
              <AppRoutes />
            </Router>
          </ChakraProvider>
        </CaptureProvider>
      </AuthProvider>
    </PolybaseProvider>
  )
}
