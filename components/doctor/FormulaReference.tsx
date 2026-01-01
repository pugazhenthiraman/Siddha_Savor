'use client';

export function FormulaReference() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">BMR & TDEE Calculation Reference</h2>
        
        {/* BMR Formula */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
              📊
            </span>
            BMR (Basal Metabolic Rate) Formula
          </h3>
          
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 mb-2">
              <strong>Formula varies by age and gender:</strong>
            </p>
            <p className="text-green-700 font-mono text-sm">
              BMR = (Coefficient × Weight in kg) + Constant
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Male Formula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Female Formula
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    18-30 years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0669W + 2.28
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0546W + 2.33
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    30-60 years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0592W + 2.48
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0407W + 2.90
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Above 60 years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0563W + 2.15
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    0.0424W + 2.38
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Example Calculation:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Male, 25 years, 70kg:</strong></p>
              <p className="font-mono">BMR = 0.0669 × 70 + 2.28 = 4.683 + 2.28 = <strong>6.96 MJ/day</strong></p>
            </div>
          </div>
        </div>

        {/* TDEE Formula */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
              ⚡
            </span>
            TDEE (Total Daily Energy Expenditure) Formula
          </h3>
          
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <p className="text-purple-700 font-mono text-lg font-semibold text-center">
              TDEE = BMR × Activity Factor
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Male Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Female Factor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      MILD
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Soft Work (Desk job, minimal activity)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    1.55
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    1.56
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      MODERATE
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Medium Work (Regular physical activity)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    1.76
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    1.64
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      HEAVY
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Hard Work (Intense physical labor)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    2.10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    1.82
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Complete Example:</h4>
            <div className="text-sm text-orange-800 space-y-1">
              <p><strong>Female, 35 years, 60kg, Medium Work (Moderate Activity):</strong></p>
              <p className="font-mono">Step 1: BMR = 0.0407 × 60 + 2.90 = 2.442 + 2.90 = <strong>5.34 MJ/day</strong></p>
              <p className="font-mono">Step 2: TDEE = 5.34 × 1.64 = <strong>8.76 MJ/day</strong></p>
            </div>
          </div>
        </div>

        {/* BMI Reference */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
              📏
            </span>
            BMI (Body Mass Index) Reference
          </h3>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-blue-700 font-mono text-lg font-semibold text-center">
              BMI = Weight (kg) ÷ Height² (m²)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="font-semibold text-blue-900">Underweight</p>
              <p className="text-blue-700 font-mono">&lt; 18.5</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="font-semibold text-green-900">Normal</p>
              <p className="text-green-700 font-mono">18.5 - 24.9</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <p className="font-semibold text-yellow-900">Overweight</p>
              <p className="text-yellow-700 font-mono">25.0 - 29.9</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <p className="font-semibold text-red-900">Obese</p>
              <p className="text-red-700 font-mono">≥ 30.0</p>
            </div>
          </div>
        </div>

        {/* Units Note */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>BMR & TDEE Units:</strong> MJ/day (Megajoules per day)</li>
            <li>• <strong>Weight:</strong> Always use kilograms (kg)</li>
            <li>• <strong>Height:</strong> Use centimeters (cm) for BMI, converts to meters internally</li>
            <li>• <strong>Age:</strong> Use patient's current age in years</li>
            <li>• <strong>Activity Level:</strong> Based on patient's work type selection during registration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
