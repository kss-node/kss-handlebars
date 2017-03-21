/* eslint-disable max-nested-callbacks,no-regex-spaces */

'use strict';

const cli = require('kss/lib/cli'),
  mockStream = require('mock-utf8-stream');

describe('KssBuilderHandlebars builder', function() {
  before(function() {
    let stdout = new mockStream.MockWritableStream(),
      stderr = new mockStream.MockWritableStream();

    stdout.startCapture();
    stderr.startCapture();

    this.files = {};

    return cli({
      stdout: stdout,
      stderr: stderr,
      argv: ['node', 'bin/kss', 'test/fixtures/with-include', 'test/output', '--builder', 'kss-handlebars', '--title', 'KssBuilderHandlebars Test Style Guide', '--verbose']
    }).then(() => {
      this.stdout = stdout.capturedData;
      return Promise.all(
        [
          'index',
          'section-2',
          'section-3',
          'section-4'
        ].map(fileName => {
          return fs.readFileAsync(path.join(__dirname, 'output', fileName + '.html'), 'utf8').then(data => {
            this.files[fileName] = data;
          });
        })
      );
    });
  });

  it('should build successfully', function() {
    [
      'index',
      'section-2',
      'section-3',
      'section-4'
    ].forEach(fileName => {
      expect(this.files).to.have.property(fileName);
      expect(this.files[fileName]).to.not.be.empty;
    });
  });

  it('should render the --title option', function() {
    expect(this.files['index']).to.include('<title>KssBuilderHandlebars Test Style Guide</title>');
  });

  describe('builder\'s Handlebars helpers', function() {
    it('should load Handlebars helper: {{section [arg]}}', function() {
      expect(this.files['section-3']).to.include('Handlebars Section Helper Test 3');
      expect(this.files['section-3']).to.include('Section 3 has been successfully loaded.');
      expect(this.files['section-3']).to.include('Handlebars Section Helper Test Fail');
    });

    it('should load Handlebars helper: {{eachSection [arg]}}', function() {
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper Test 2.1.3');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper Test 2.1.4');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: :hover');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .stars-given<');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .stars-given:hover');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .disabled');
    });
  });
});
