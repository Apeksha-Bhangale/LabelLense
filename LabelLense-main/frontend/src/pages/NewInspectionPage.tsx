import React, { useState } from 'react';
import {
  FilePlus,
  Building,
  Store,
  Calendar,
  UserCheck,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { PageView, InspectionDetail } from '../types';
import { createInspection } from '../api';

interface NewInspectionPageProps {
  onInspectionCreated: (inspection: InspectionDetail) => void;
  onNavigate: (page: PageView) => void;
}

export const NewInspectionPage: React.FC<NewInspectionPageProps> = ({
  onInspectionCreated,
  onNavigate,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    // Product
    product_name: '',
    brand: '',
    product_category: 'Packaged Food',
    product_type: 'Standard Consumer Retail Pack',
    manufacturer_details: '',
    importer_details: '',
    batch_lot_number: '',

    // Inspection
    shop_name: '',
    shop_address: '',
    district: 'Gurugram',
    state: 'Haryana',
    inspection_date: new Date().toISOString().slice(0, 10),
    inspector_name: 'Rajesh Kumar Sharma',
    inspector_id: 'LM-INSP-HR-048',
    inspection_notes: 'Market surveillance compliance inspection.',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quick Preset Samples for evaluators
  const applyPreset = (preset: 'rice' | 'spread' | 'syrup') => {
    if (preset === 'rice') {
      setFormData({
        product_name: 'Royal Heritage Classic Basmati Rice 5kg',
        brand: 'Royal Heritage',
        product_category: 'Packaged Food Grain',
        product_type: 'Standard Poly Pack',
        manufacturer_details:
          'Heritage Agro Foods Pvt. Ltd., Plot 42-45, Phase III, Food Park, Sonipat, Haryana - 131001',
        importer_details: '',
        batch_lot_number: 'RH-B24-8902',
        shop_name: 'Modern Hypermarket & Departmental Stores',
        shop_address: 'Shop 14-16, Sector 29 Commercial Complex',
        district: 'Gurugram',
        state: 'Haryana',
        inspection_date: new Date().toISOString().slice(0, 10),
        inspector_name: 'Rajesh Kumar Sharma',
        inspector_id: 'LM-INSP-HR-048',
        inspection_notes: 'Routine legal metrology surveillance.',
      });
    } else if (preset === 'spread') {
      setFormData({
        product_name: 'AlpsDelight Gourmet Hazelnut Cocoa Spread 350g',
        brand: 'AlpsDelight',
        product_category: 'Packaged Confectionery',
        product_type: 'Imported Retail Glass Jar',
        manufacturer_details: 'Confectionery Alps S.p.A., Torino, Italy',
        importer_details:
          'Continental Gourmet Imports Ltd., Building 12, Export Zone, Andheri East, Mumbai - 400069',
        batch_lot_number: 'AD-ITA-9921',
        shop_name: 'Gourmet Avenue Delicatessen',
        shop_address: 'Shop 4, Linking Road, Bandra West',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        inspection_date: new Date().toISOString().slice(0, 10),
        inspector_name: 'Pooja V. Patil',
        inspector_id: 'LM-INSP-MH-112',
        inspection_notes:
          'Verification of imported commodity statutory labels under Rule 6(10) & 6(1)(e).',
      });
    } else if (preset === 'syrup') {
      setFormData({
        product_name: 'Breathe-Easy Herbal Cough Relief Syrup 100ml',
        brand: 'AyurVeda',
        product_category: 'Ayurvedic Medicine / Liquid Formulation',
        product_type: 'Glass Bottle 100ml with Carton',
        manufacturer_details:
          'AyurVeda Pharmaceuticals India Limited, Plot 88, Herbal Valley, Solan, HP - 173212',
        importer_details: '',
        batch_lot_number: 'BY-0284',
        shop_name: 'Sanjeevani Medicos & Wellness Store',
        shop_address: 'Shop 12, Main Market, Solan',
        district: 'Solan',
        state: 'Himachal Pradesh',
        inspection_date: new Date().toISOString().slice(0, 10),
        inspector_name: 'Anil Verma',
        inspector_id: 'LM-INSP-HP-019',
        inspection_notes: 'Verification of batch stamping clarity and legibility.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.brand.trim()) {
      setError('Brand name is required.');
      return;
    }
    if (!formData.shop_name.trim()) {
      setError('Shop or retailer name is required.');
      return;
    }
    if (!formData.shop_address.trim()) {
      setError('Shop address is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await createInspection(formData);
      onInspectionCreated(created);
    } catch (err: any) {
      setError(err.message || 'Failed to create new inspection record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 mb-1.5">
            <FilePlus className="w-3.5 h-3.5 text-teal-600" />
            <span>Inspection Workflow • Step 1 of 5</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Initiate New Package Inspection
          </h1>
          <p className="text-xs text-slate-500">
            Enter product and premises details under Legal Metrology (Packaged Commodities) Rules, 2011. A unique Inspection ID will be assigned.
          </p>
        </div>

        {/* Quick Demo Pre-fill for Evaluators */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 pl-1.5">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Demo Autofill:</span>
          </span>
          <button
            type="button"
            onClick={() => applyPreset('rice')}
            className="text-xs font-medium px-2 py-1 rounded bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 shadow-2xs border border-slate-200 transition-colors"
          >
            Basmati Rice
          </button>
          <button
            type="button"
            onClick={() => applyPreset('spread')}
            className="text-xs font-medium px-2 py-1 rounded bg-white hover:bg-red-50 hover:text-red-700 text-slate-700 shadow-2xs border border-slate-200 transition-colors"
          >
            Imported Spread
          </button>
          <button
            type="button"
            onClick={() => applyPreset('syrup')}
            className="text-xs font-medium px-2 py-1 rounded bg-white hover:bg-amber-50 hover:text-amber-700 text-slate-700 shadow-2xs border border-slate-200 transition-colors"
          >
            Cough Syrup
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Product Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wide">
              Product Information
            </h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="e.g. Royal Heritage Classic Basmati Rice 5kg"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Royal Heritage"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Category
              </label>
              <select
                name="product_category"
                value={formData.product_category}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Packaged Food Grain">Packaged Food Grain / Staples</option>
                <option value="Packaged Confectionery">Packaged Confectionery & Spreads</option>
                <option value="Beverages & Juices">Beverages & Juices</option>
                <option value="Ayurvedic Medicine / Liquid Formulation">Ayurvedic / OTC Formulation</option>
                <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                <option value="Household Cleaners & Chemicals">Household Cleaners & Chemicals</option>
                <option value="Electronics & Accessories">Electronics & Accessories</option>
                <option value="General Packaged Commodity">General Packaged Commodity</option>
              </select>
            </div>

            {/* Product Type / Packaging Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Packaging Type / Format
              </label>
              <input
                type="text"
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                placeholder="e.g. Standard Consumer Pack / Imported Glass Jar / Poly Pouch"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Batch / Lot Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch or Lot Number (where available)
              </label>
              <input
                type="text"
                name="batch_lot_number"
                value={formData.batch_lot_number}
                onChange={handleChange}
                placeholder="e.g. RH-B24-8902 (Leave blank if not found on pack)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Manufacturer Details */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturer or Packer Details (where observed)
              </label>
              <textarea
                name="manufacturer_details"
                rows={2}
                value={formData.manufacturer_details}
                onChange={handleChange}
                placeholder="Name and complete physical address of manufacturer/packer (can also be extracted automatically by OCR)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Importer Details */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Importer Details (applicable for imported commodities)
              </label>
              <input
                type="text"
                name="importer_details"
                value={formData.importer_details}
                onChange={handleChange}
                placeholder="Name and registered address of importer (leave blank for domestic goods)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Inspection & Premises Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
            <Store className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wide">
              Inspection & Premises Information
            </h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop or Retailer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="e.g. Modern Hypermarket & Departmental Stores"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Inspection Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="inspection_date"
                value={formData.inspection_date}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Shop Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop / Premises Physical Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shop_address"
                value={formData.shop_address}
                onChange={handleChange}
                placeholder="Street address, market name, plot number"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Gurugram"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Haryana"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inspector_name"
                value={formData.inspector_name}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Inspector Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector ID / Badge No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inspector_id"
                value={formData.inspector_id}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                required
              />
            </div>

            {/* Inspection Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Notes / Context
              </label>
              <textarea
                name="inspection_notes"
                rows={2}
                value={formData.inspection_notes}
                onChange={handleChange}
                placeholder="Reason for inspection (e.g. routine surveillance, consumer grievance, targeted drive)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel & Return to Dashboard
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Creating Inspection...' : 'Proceed to Label Capture & OCR'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
