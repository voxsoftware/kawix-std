/* Copyright 2019 Kodhe contacto@kodhe.com*/
/** returns a promisified version of fs */

import Promisify from '../util/promisify.js'
import fs from 'fs'
export default Promisify.promisifyAllWithSuffix(fs)