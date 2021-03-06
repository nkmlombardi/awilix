const createContainer = require('../../lib/createContainer')
const { asClass } = require('../../lib/registrations')
const ResolutionMode = require('../../lib/ResolutionMode')

class Test {
  constructor({ value }) {
    this.value = value
  }
}

class TestClassic {
  constructor(test, value) {
    this.test = test
    this.value = value
  }
}

const makeTest = ({ value }) => ({ value, isTest: true })
const makeCLassicTest = (test, value) => ({ value, test })

const injector = () => ({ value: 42 })

describe('local injections', function() {
  it('invokes the injector and provides the result to the constructor', function() {
    const container = createContainer().register({
      test: asClass(Test).inject(injector),
      testClassic: asClass(TestClassic)
        .inject(injector)
        .classic(),
      test2: asClass(Test)
    })

    expect(container.cradle.test.value).to.equal(42)

    expect(container.cradle.testClassic.test).to.be.an.instanceOf(Test)
    expect(container.cradle.testClassic.value).to.equal(42)

    expect(() => container.cradle.test2.value).to.throw(
      /Could not resolve 'value'/
    )
  })

  it('supported by registerClass', function() {
    const container = createContainer().registerClass({
      test: [Test, { injector }],
      testClassic: [
        TestClassic,
        { injector, resolutionMode: ResolutionMode.CLASSIC }
      ],
      test2: Test
    })

    expect(container.cradle.test.value).to.equal(42)

    expect(container.cradle.testClassic.test).to.be.an.instanceOf(Test)
    expect(container.cradle.testClassic.value).to.equal(42)
    expect(() => container.cradle.test2.value).to.throw(
      /Could not resolve 'value'/
    )
  })

  it('supported by registerFunction', function() {
    const container = createContainer().registerFunction({
      test: [makeTest, { injector }],
      testClassic: [
        makeCLassicTest,
        { injector, resolutionMode: ResolutionMode.CLASSIC }
      ],
      test2: makeTest
    })

    expect(container.cradle.test.value).to.equal(42)

    expect(container.cradle.testClassic.test.isTest).to.be.true
    expect(container.cradle.testClassic.value).to.equal(42)
    expect(() => container.cradle.test2.value).to.throw(
      /Could not resolve 'value'/
    )
  })
})
