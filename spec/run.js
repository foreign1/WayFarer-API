import Jasmine from 'jasmine';
import CustomReporter from 'jasmine-console-reporter';

const jasmine = new Jasmine();
jasmine.loadConfigFile('spec/support/jasmine.json');

const customReporter = new CustomReporter();

jasmine.addReporter(customReporter);
jasmine.execute();
