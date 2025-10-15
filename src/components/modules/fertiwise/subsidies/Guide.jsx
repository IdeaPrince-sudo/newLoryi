




function Guide() {

    return(
        <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Subsidy Program Guide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">How to Apply</h3>
            <ol className="list-decimal pl-4 text-sm text-gray-700 space-y-1">
              <li>Browse available subsidy programs that match your region and needs</li>
              <li>Check eligibility requirements and prepare required documents</li>
              <li>Complete the online application form before the deadline</li>
              <li>Submit supporting documents for verification</li>
              <li>Track your application status through your account</li>
            </ol>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Eligibility Criteria</h3>
            <p className="text-sm text-gray-700 mb-2">
              Most fertilizer subsidy programs require applicants to meet the following criteria:
            </p>
            <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
              <li>Registered farmer with valid documentation</li>
              <li>Land ownership or lease agreement</li>
              <li>Farm size within program limits</li>
              <li>Cultivation of eligible crops</li>
              <li>Good standing with previous subsidies (if applicable)</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
            <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
              <li>Applications are processed on a first-come, first-served basis</li>
              <li>Limited funding may close programs before the deadline</li>
              <li>Incorrect or incomplete applications will be rejected</li>
              <li>Verification visits may be conducted to confirm farm details</li>
              <li>Contact the helpline at +1-800-FERTIWISE for assistance</li>
            </ul>
          </div>
        </div>
      </div>
    );
};

export default Guide;

