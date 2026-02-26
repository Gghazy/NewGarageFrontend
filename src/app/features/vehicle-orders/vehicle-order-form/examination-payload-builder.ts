import {
  CreateExaminationRequest,
  UpdateExaminationRequest,
  ExaminationItemRequest,
} from 'src/app/shared/Models/vehicle-orders/vehicle-order-request';
import { ClientFormData, VehicleFormData } from 'src/app/shared/constants/vehicle-constants';

export interface ExaminationPayloadInput {
  clientId?: string;
  clientType: string;
  clientData: ClientFormData;
  vehicleData: VehicleFormData;
  serviceItems: ExaminationItemRequest[];
  startAfterSave: boolean;
}

function buildCommonFields(input: ExaminationPayloadInput) {
  const d = input.clientData;
  const v = input.vehicleData;

  return {
    // Client
    clientType:           input.clientType,
    clientNameAr:         d.clientNameAr ?? '',
    clientNameEn:         d.clientNameEn ?? '',
    clientPhone:          d.clientPhone ?? '',
    clientEmail:          d.email || undefined,
    clientResourceId:     d.clientResourceId || undefined,
    individualAddress:    d.individualAddress || undefined,
    commercialRegister:   d.commercialRegister || undefined,
    taxNumber:            d.taxNumber || undefined,
    streetName:           d.streetName || undefined,
    additionalStreetName: d.additionalStreetName || undefined,
    cityName:             d.cityName || undefined,
    postalZone:           d.postalZone || undefined,
    countrySubentity:     d.countrySubentity || undefined,
    countryCode:          d.countryCode || undefined,
    buildingNumber:       d.buildingNumber || undefined,
    citySubdivisionName:  d.citySubdivisionName || undefined,

    // Branch + meta
    branchId:     v.branchId || undefined,
    type:         v.type ?? 'Regular',
    hasWarranty:  v.hasWarranty ?? true,
    marketerCode: v.marketerCode || undefined,
    notes:        v.notes || undefined,

    // Vehicle
    manufacturerId: v.manufacturerId || undefined,
    carMarkId:      v.carMarkId || undefined,
    year:           v.year || undefined,
    color:          v.color || undefined,
    vin:            v.vin || undefined,
    hasPlate:       v.hasPlate ?? true,
    plateLetters:   v.plateLetters || undefined,
    plateNumbers:   v.plateNumbers || undefined,
    mileage:        v.mileage || undefined,
    mileageUnit:    v.mileageUnit ?? 'Km',
    transmission:   v.transmission || undefined,

    // Services
    items: input.serviceItems,

    // Workflow
    startAfterSave: input.startAfterSave,
  };
}

export function buildCreatePayload(input: ExaminationPayloadInput): CreateExaminationRequest {
  return {
    clientId: input.clientId,
    ...buildCommonFields(input),
  } as CreateExaminationRequest;
}

export function buildUpdatePayload(input: ExaminationPayloadInput): UpdateExaminationRequest {
  return buildCommonFields(input) as UpdateExaminationRequest;
}
