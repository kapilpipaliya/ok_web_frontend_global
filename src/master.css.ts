import type { Config } from '@master/css'

import colors from '@master/colors'
// import common from 'internal/common/master.css'

import ui from './components/master_ui/core/master.css'


export default {
    extends: [
        // common,
        ui
    ],
    variables: {
        primary: colors.yellow
    }
} as Config