import './App.less'
import { Button, ConfigProvider, Image } from 'antd'
const App = () => {
  return (
    <div className="content">
      <h1>Rsbuild React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <ConfigProvider // theme={{ token: { colorPrimary: '#00b96b' } }}
      >
        <div className="App">
          <Button type="primary">Button</Button>
          <Image src={require('./logo.png')} />
        </div>
      </ConfigProvider>
    </div>
  )
}

export default App
