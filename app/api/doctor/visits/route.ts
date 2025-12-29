import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/middleware/api-error-handler';

// Mock diagnosis data - in real implementation, this would be stored in database
const mockDiagnoses = new Map();

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json(
      { success: false, error: 'Patient ID is required' },
      { status: 400 }
    );
  }

  try {
    // In real implementation, fetch from database
    const visits = mockDiagnoses.get(patientId) || [];

    return NextResponse.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    console.error('Error fetching patient visits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient visits' },
      { status: 500 }
    );
  }
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { 
      patientId, 
      diagnosis, 
      treatment, 
      medicines, 
      foods, 
      activities, 
      visitDate, 
      nextVisit, 
      notes 
    } = body;

    if (!patientId || !diagnosis || !treatment) {
      return NextResponse.json(
        { success: false, error: 'Patient ID, diagnosis, and treatment are required' },
        { status: 400 }
      );
    }

    // In real implementation, save to database
    const diagnosisRecord = {
      id: Date.now(),
      patientId: parseInt(patientId),
      diagnosis,
      treatment,
      medicines: medicines || [],
      foods: foods || [],
      activities: activities || [],
      visitDate,
      nextVisit: nextVisit || null,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    };

    // Store in mock data
    const existingVisits = mockDiagnoses.get(patientId) || [];
    existingVisits.push(diagnosisRecord);
    mockDiagnoses.set(patientId, existingVisits);

    return NextResponse.json({
      success: true,
      data: diagnosisRecord,
      message: 'Diagnosis updated successfully',
    });
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update diagnosis' },
      { status: 500 }
    );
  }
});
