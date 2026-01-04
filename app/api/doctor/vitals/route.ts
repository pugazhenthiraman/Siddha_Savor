import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
    
    // Debug log the incoming data
      patientId, 
      doctorUID,
      pulseRate,
      heartRate,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      randomBloodSugar,
      respiratoryRate,      oxygenSaturation,
      weight,
      height,
      bmi,
      bmr,
      tdee,
      naadi,
      thegi,      assessmentType,
      medicines,
      notes,
      recordedBy
    } = body;
    // Debug log the extracted fields
    console.log('Extracted fields:', {
      patientId, doctorUID, weight, naadi, thegi, assessmentType
    });

    console.log('About to create vitals record with data:', {
      patientId: parseInt(patientId),
      doctorUID,
      weight: weight ? parseFloat(weight) : null,
      naadi,
      thegi,
      assessmentType
    });
    // Create new vitals record
    
    console.log('Creating vitals with data:', {
      patientId: parseInt(patientId),
      doctorUID,
      weight: weight ? parseFloat(weight) : null,
      naadi,
      thegi
    });    const vitals = await prisma.patientVitals.create({
      data: {
        patientId: parseInt(patientId),
        doctorUID,
        pulseRate: pulseRate ? parseInt(pulseRate) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
        randomBloodSugar: randomBloodSugar ? parseInt(randomBloodSugar) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        oxygenSaturation: oxygenSaturation ? parseFloat(oxygenSaturation) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseInt(height) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        bmr: bmr ? parseFloat(bmr) : null,
        tdee: tdee ? parseFloat(tdee) : null,
        assessmentType,
        naadi,
        thegi,
        medicines: medicines || [],
        notes,
        recordedBy
      }
    });

    logger.info('Patient vitals updated successfully', {
      patientId,
      doctorUID,
      hasVitals: true,
      hasDiagnosis: !!notes
    });

    return NextResponse.json({ 
      success: true, 
      vitals,
      message: 'Vitals saved successfully' 
    });

  } catch (error) {
    console.error('DETAILED ERROR:', error);
    console.error('ERROR TYPE:', typeof error);
    console.error('ERROR MESSAGE:', error instanceof Error ? error.message : String(error));    logger.error('Error saving patient vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save vitals' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Debug log the incoming data
    console.log('Received vitals data:', JSON.stringify(body, null, 2));
    
    const { 
      id,
      patientId, 
      doctorUID,
      pulseRate,
      heartRate,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      randomBloodSugar,
      weight,
      respiratoryRate,      height,
      bmi,
      bmr,
      tdee,
      naadi,
      thegi,
      assessmentType,
      medicines,
      notes,
      recordedBy
    } = body;

    // Update existing vitals record
    const vitals = await prisma.patientVitals.update({
      where: { id: parseInt(id) },
      data: {
        pulseRate: pulseRate ? parseInt(pulseRate) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
        // randomBloodSugar: randomBloodSugar ? parseInt(randomBloodSugar) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseInt(height) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        bmr: bmr ? parseFloat(bmr) : null,
        tdee: tdee ? parseFloat(tdee) : null,
        assessmentType,
        naadi,
        thegi,
        medicines: medicines || [],
        notes,
        recordedBy
      }
    });

    logger.info('Patient vitals updated successfully', {
      id,
      patientId,
      doctorUID
    });

    return NextResponse.json({ 
      success: true, 
      vitals,
      message: 'Vitals updated successfully' 
    });

  } catch (error) {
    logger.error('Error updating patient vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vitals' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorUID = searchParams.get('doctorUID');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Get patient vitals history
    const vitals = await prisma.patientVitals.findMany({
      where: {
        patientId: parseInt(patientId),
        ...(doctorUID && { doctorUID })
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        doctor: {
          select: {
            doctorUID: true,
            formData: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      vitals 
    });

  } catch (error) {
    logger.error('Error fetching patient vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vitals' },
      { status: 500 }
    );
  }
}
