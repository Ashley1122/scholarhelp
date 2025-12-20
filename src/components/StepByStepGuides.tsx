import { BookOpen, CheckCircle } from 'lucide-react';
import '../styles/StepByStepGuides.css';

interface GuideStep {
  title: string;
  description: string;
}

interface Guide {
  title: string;
  category: string;
  steps: GuideStep[];
}

const guides: Guide[] = [
  {
    title: "How to Apply for Post-Matric Scholarship",
    category: "NSP Portal",
    steps: [
      {
        title: "Visit NSP Website",
        description: "Go to scholarships.gov.in and click on 'New Registration'"
      },
      {
        title: "Register Your Account",
        description: "Fill in your name, date of birth, mobile number, and email. You'll receive an OTP."
      },
      {
        title: "Complete Your Profile",
        description: "Enter student details: Aadhaar number, category, gender, and address"
      },
      {
        title: "Select Scholarship Scheme",
        description: "Choose 'Post-Matric Scholarship' from the list of available schemes"
      },
      {
        title: "Fill Application Form",
        description: "Enter your academic details, institute information, and bank account details"
      },
      {
        title: "Upload Documents",
        description: "Upload: passport photo (under 100 KB), income certificate, caste certificate, bank passbook, previous marksheet"
      },
      {
        title: "Review and Submit",
        description: "Check all information carefully and click 'Final Submit'. Save the acknowledgment receipt."
      },
      {
        title: "Track Application",
        description: "Use your application ID to check status regularly on the NSP portal"
      }
    ]
  },
  {
    title: "Preparing Documents for Scholarship",
    category: "Document Tips",
    steps: [
      {
        title: "Gather Original Documents",
        description: "Collect: Aadhaar card, caste certificate, income certificate, bank passbook, previous marksheets"
      },
      {
        title: "Get Clear Scans/Photos",
        description: "Take clear photos in good lighting. Make sure all text is readable."
      },
      {
        title: "Use Image Resizer Tool",
        description: "Most portals require images under 200 KB. Use our Image Resizer tool above to compress images."
      },
      {
        title: "Convert to PDF if Needed",
        description: "Some applications need PDF format. Use our Image to PDF tool to combine multiple pages."
      },
      {
        title: "Check File Sizes",
        description: "Verify each file is within the size limit mentioned on the application form"
      },
      {
        title: "Keep Backup Copies",
        description: "Save all compressed files in a folder on your phone or computer for quick access"
      }
    ]
  },
  {
    title: "Common Mistakes to Avoid",
    category: "Important Tips",
    steps: [
      {
        title: "Wrong Bank Account Details",
        description: "Double-check your account number and IFSC code. Use account in student's name only."
      },
      {
        title: "Expired Certificates",
        description: "Income and caste certificates should be recent (usually within 1 year)"
      },
      {
        title: "Photo Size Too Large",
        description: "Most portals reject photos over 100-200 KB. Always compress before uploading."
      },
      {
        title: "Missing Deadline",
        description: "Don't wait for the last day. Apply at least 10 days before deadline."
      },
      {
        title: "Wrong Category Selection",
        description: "Choose the correct caste/category as per your certificate"
      },
      {
        title: "Not Saving Acknowledgment",
        description: "Always download and save the acknowledgment receipt after submission"
      }
    ]
  }
];

export default function StepByStepGuides() {
  return (
    <section className="guides-section" id="guides">
      <div className="container">
        <h2 className="section-title">Step-by-Step Guides</h2>
        <p className="section-subtitle">Simple instructions to help you apply successfully</p>
        
        <div className="guides-grid">
          {guides.map((guide, index) => (
            <div key={index} className="guide-card">
              <div className="guide-header">
                <BookOpen size={24} />
                <div>
                  <h3>{guide.title}</h3>
                  <span className="guide-category">{guide.category}</span>
                </div>
              </div>
              
              <div className="guide-steps">
                {guide.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="guide-step">
                    <div className="step-number">
                      <CheckCircle size={20} />
                      <span>{stepIndex + 1}</span>
                    </div>
                    <div className="step-content">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="help-note">
          <p>Need more help? These guides are in simple English. We'll add regional language support soon!</p>
        </div>
      </div>
    </section>
  );
}
