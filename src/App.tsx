import './App.css'
import Header from './components/Header'
import QuickNav from './components/QuickNav'
import ScholarshipInfo from './components/ScholarshipInfo'
import DocumentTools from './components/DocumentTools'
import StepByStepGuides from './components/StepByStepGuides'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <QuickNav />
        <ScholarshipInfo />
        <DocumentTools />
        <StepByStepGuides />
      </main>
      <Footer />
    </div>
  )
}

export default App
