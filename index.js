import { config } from 'dotenv'
import express from 'express'
import path from 'path'
import { IntiateApp } from './src/utils/initiateApp.js'
config({path:path.resolve('./Config/config.env')})

const app=express()

IntiateApp(app,express)

