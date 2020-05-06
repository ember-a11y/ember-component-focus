import Application from '../app';
import { start } from 'ember-qunit'; 
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import setupSinon from 'ember-sinon-qunit';

setApplication(Application.create(config.APP));

setupSinon();
 
start(); 
