import React from "react";
import { Sliders, Building, Wrench } from "lucide-react";
import { DocketConfig } from "../../../../types";

interface DocketLayoutTabProps {
  docketConfig: DocketConfig;
  onUpdateDocketConfig: (config: DocketConfig) => void;
}

export default function DocketLayoutTab({ docketConfig, onUpdateDocketConfig }: DocketLayoutTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Docket Design & Layout Customization</h3>
          <p className="text-xs text-gray-500">Configure legal business entities, contact details, EFT payment parameters, and logo brand settings for professional A4 delivery dockets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-6 bg-slate-50/50 p-5 rounded-2xl border border-gray-100">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-blue-600" />
              Company Identity Details
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Trading / Business Name</label>
              <textarea
                rows={2}
                value={docketConfig.businessName}
                onChange={(e) => onUpdateDocketConfig({ ...docketConfig, businessName: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">P.O. Box / Address</label>
                <input
                  type="text"
                  value={docketConfig.poBox}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, poBox: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">ABN Number</label>
                <input
                  type="text"
                  value={docketConfig.abn}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, abn: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Contact Phone / Mobile</label>
                <input
                  type="text"
                  value={docketConfig.contact}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, contact: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Fax Number</label>
                <input
                  type="text"
                  value={docketConfig.fax}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, fax: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Official Email Address</label>
              <input
                type="email"
                value={docketConfig.email}
                onChange={(e) => onUpdateDocketConfig({ ...docketConfig, email: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-emerald-600" />
              EFT Payment Details
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">EFT Account Name</label>
              <input
                type="text"
                value={docketConfig.eftAccountName}
                onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftAccountName: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">BSB Code</label>
                <input
                  type="text"
                  value={docketConfig.eftBsb}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftBsb: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Account Number</label>
                <input
                  type="text"
                  value={docketConfig.eftAccountNo}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftAccountNo: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-purple-600" />
              Docket Theme & Brand
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Weighbridge Location Name</label>
              <input
                type="text"
                value={docketConfig.weighbridgeLocation}
                onChange={(e) => onUpdateDocketConfig({ ...docketConfig, weighbridgeLocation: e.target.value })}
                className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Logo Brand Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={docketConfig.logoColor}
                    onChange={(e) => onUpdateDocketConfig({ ...docketConfig, logoColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={docketConfig.logoColor}
                    onChange={(e) => onUpdateDocketConfig({ ...docketConfig, logoColor: e.target.value })}
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="showLogoCheckbox"
                  checked={docketConfig.showLogo}
                  onChange={(e) => onUpdateDocketConfig({ ...docketConfig, showLogo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="showLogoCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display Logo on Docket
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive preview panel */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live A4 Docket Preview (Scale Adjusted)
          </span>

          <div className="w-full bg-slate-100 p-8 rounded-2xl border border-slate-200 flex justify-center shadow-inner overflow-x-auto">
            {/* Miniature A4 Sheet Aspect Ratio (roughly 1:1.41) */}
            <div className="w-[520px] min-h-[730px] bg-white border border-slate-300 shadow-xl p-8 text-slate-800 flex flex-col justify-between font-sans text-[10px] leading-relaxed relative select-none">
              <div>
                {/* Top Branding Section */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                  {/* Custom SVG dynamic logo */}
                  <div className="flex items-center gap-3">
                    {docketConfig.showLogo && (
                      <div className="flex flex-col items-center shrink-0">
                        <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill={docketConfig.logoColor} opacity="0.15" />
                          <path d="M50 15L80 40H20L50 15Z" fill={docketConfig.logoColor} />
                          <path d="M45 40H55V85H45V40Z" fill={docketConfig.logoColor} />
                          <path d="M30 55L50 45L70 55L50 65L30 55Z" fill="#fff" opacity="0.9" />
                          <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill={docketConfig.logoColor} />
                        </svg>
                        <span className="text-[7px] font-black tracking-widest uppercase mt-1" style={{ color: docketConfig.logoColor }}>
                          BLACK OAK
                        </span>
                      </div>
                    )}
                    <div className="max-w-[180px]">
                      <h4 className="font-black text-xs uppercase tracking-tight leading-tight text-slate-900">
                        {docketConfig.eftAccountName}
                      </h4>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Certified Weighbridge Material Record
                      </span>
                    </div>
                  </div>

                  {/* Top Right Address block */}
                  <div className="text-right text-[8px] space-y-0.5 text-slate-600 max-w-[200px]">
                    <p className="font-bold text-slate-900 leading-tight">{docketConfig.businessName}</p>
                    <p>{docketConfig.poBox}</p>
                    <p>CONTACT: {docketConfig.contact}</p>
                    <p>FAX: {docketConfig.fax}</p>
                    <p>EMAIL: {docketConfig.email}</p>
                    <p className="font-semibold">ABN: {docketConfig.abn}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center my-4">
                  <h2 className="text-sm font-black tracking-widest text-slate-900 border-y border-slate-200 py-1.5 uppercase">
                    DELIVERY DOCKET
                  </h2>
                </div>

                {/* Header Fields grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[9px] border-b border-slate-100 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex"><span className="w-24 font-bold text-slate-500">TO :</span> <span className="font-black text-slate-800">Intract Australia Pty Ltd</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">JOB NUMBER :</span> <span className="font-mono font-bold text-slate-800">J-731</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">PURCHASE ORDER :</span> <span className="font-semibold text-slate-700">3200110 - SITE 3 SP2-SP5</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">TRANSPORT COMPANY :</span> <span className="font-semibold text-slate-700">Zaclan Transport</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">WEIGHBRIDGE LOCATION :</span> <span className="font-bold text-slate-800">{docketConfig.weighbridgeLocation}</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex"><span className="w-24 font-bold text-slate-500">DATE :</span> <span className="font-bold text-slate-800">2026-06-22</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">TIME :</span> <span className="font-bold text-slate-800">16 : 08 pm</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">DOCKET NUMBER :</span> <span className="font-mono font-black text-slate-900 text-[10px]">BQA23650</span></div>
                    <div className="flex"><span className="w-24 font-bold text-slate-500">DESTINATION :</span> <span className="font-bold text-slate-800">SP2 - SP5 - Site 3</span></div>
                  </div>
                </div>

                {/* Middle Grid */}
                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4 mb-4 text-[9px]">
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                    <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">TRAILER</span>
                    <span className="font-bold text-slate-500">N/A (Standard Unit)</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1">
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">TRUCK REG NO.</span>
                      <span className="font-mono font-black text-slate-900">S176BPB</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">PRODUCT</span>
                      <span className="font-black text-blue-800">20MM QR PM2/20QG WET</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">LOT NUMBER</span>
                      <span className="font-semibold text-slate-600">L-850 LOT 20</span>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1 text-right">
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">TRUCK GROSS</span>
                      <span className="font-mono font-bold text-slate-800">5.00 t</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">STORED TARE</span>
                      <span className="font-mono font-bold text-slate-500">0.80 t</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">TRUCK NETT</span>
                      <span className="font-mono font-black text-emerald-600 text-[11px]">4.20 t</span>
                    </div>
                  </div>
                </div>

                {/* Order Weights block */}
                <div className="mb-4">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    TOTAL ORDER WEIGHT SUMMARY:
                  </span>
                  <table className="w-full text-center border border-slate-200 border-collapse text-[9px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="py-1 border-r border-slate-200">Gross (t)</th>
                        <th className="py-1 border-r border-slate-200">Tare (t)</th>
                        <th className="py-1">Net Weight (t)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-mono font-black text-slate-950 text-xs">
                        <td className="py-2 border-r border-slate-200">5.00</td>
                        <td className="py-2 border-r border-slate-200">0.80</td>
                        <td className="py-2 text-blue-600">4.20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-12 border border-slate-200 rounded-lg p-2 bg-slate-50/20 text-[8px] text-slate-600">
                    <span className="font-bold text-slate-900">DRIVER COMMENTS & SAFETY PRECAUTIONS:</span>
                    <p className="mt-0.5">Own Driver. Ensure compliance with strict 20km/h quarry speed limits. PPE safety glasses, vest, and steel caps mandatory.</p>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="space-y-4">
                {/* EFT Payments Info */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">
                      EFT PAYMENTS BANKING
                    </span>
                    <div className="grid grid-cols-3 gap-x-4 mt-1 text-[8px] text-slate-600">
                      <div><span className="font-semibold text-slate-800">Account Name:</span> {docketConfig.eftAccountName}</div>
                      <div><span className="font-semibold text-slate-800">BSB:</span> {docketConfig.eftBsb}</div>
                      <div><span className="font-semibold text-slate-800">Account No:</span> {docketConfig.eftAccountNo}</div>
                    </div>
                  </div>
                  <span className="text-[7px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded tracking-wide uppercase font-mono shrink-0">
                    EFT APPROVED
                  </span>
                </div>

                {/* Signature block */}
                <div className="grid grid-cols-2 gap-8 pt-2">
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block mb-1">Customer Copy:</span>
                    <div className="border-t border-slate-400 pt-1 text-[8px] text-slate-500 font-semibold italic text-center">
                      Received in Good Order
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block mb-1">Weighbridge Operator:</span>
                    <div className="border-t border-slate-400 pt-1 text-[8px] text-slate-900 font-bold text-center">
                      (For {docketConfig.eftAccountName})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
