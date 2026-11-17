import { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Building2, Home } from 'lucide-react';
import { VIETNAM_PROVINCES, parseAddressString } from '../../data/vietnamAddressData.js';

export default function AddressDropdownSelector({
  value,
  onChange,
  onRegionChange,
}) {
  // Parse initial address if provided, default to Đà Nẵng
  const parsed = useMemo(() => parseAddressString(value), [value]);

  const defaultProvince = VIETNAM_PROVINCES[0]; // Đà Nẵng
  const [provinceId, setProvinceId] = useState(parsed?.provinceId || defaultProvince.id);

  const currentProvince = useMemo(
    () => VIETNAM_PROVINCES.find((p) => p.id === provinceId) || defaultProvince,
    [provinceId, defaultProvince]
  );

  const [districtId, setDistrictId] = useState(
    parsed?.districtId || currentProvince.districts[0]?.id || ''
  );

  const currentDistrict = useMemo(
    () => currentProvince.districts.find((d) => d.id === districtId) || currentProvince.districts[0],
    [currentProvince, districtId]
  );

  const [wardName, setWardName] = useState(
    parsed?.wardName || currentDistrict?.wards[0] || ''
  );

  const [streetName, setStreetName] = useState(
    currentDistrict?.streets?.[0] || 'Tuyến đường trung tâm phường/xã'
  );

  // Sync when province changes
  const handleProvinceChange = (e) => {
    const newProvId = e.target.value;
    setProvinceId(newProvId);
    const newProv = VIETNAM_PROVINCES.find((p) => p.id === newProvId);
    if (newProv) {
      const firstDist = newProv.districts[0];
      setDistrictId(firstDist?.id || '');
      setWardName(firstDist?.wards[0] || '');
      setStreetName(firstDist?.streets?.[0] || 'Tuyến đường trung tâm');
      if (onRegionChange) {
        onRegionChange(newProv.region);
      }
    }
  };

  // Sync when district changes
  const handleDistrictChange = (e) => {
    const newDistId = e.target.value;
    setDistrictId(newDistId);
    const newDist = currentProvince.districts.find((d) => d.id === newDistId);
    if (newDist) {
      setWardName(newDist.wards[0] || '');
      setStreetName(newDist.streets?.[0] || 'Tuyến đường trung tâm');
    }
  };

  // Sync full address when selections change
  useEffect(() => {
    if (!currentProvince || !currentDistrict || !wardName) return;

    let fullAddress = '';
    if (streetName && !streetName.toLowerCase().includes('tuyến đường trung tâm')) {
      fullAddress = `${streetName}, ${wardName}, ${currentDistrict.name}, ${currentProvince.name}`;
    } else {
      fullAddress = `${wardName}, ${currentDistrict.name}, ${currentProvince.name}`;
    }

    if (onChange) {
      onChange(fullAddress, currentProvince.region);
    }
  }, [currentProvince, currentDistrict, wardName, streetName, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Dropdown 1: Tỉnh / Thành phố */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
          <Building2 size={13} color="#0284c7" /> Tỉnh / Thành phố
        </label>
        <select
          value={provinceId}
          onChange={handleProvinceChange}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {VIETNAM_PROVINCES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.region === 'north' ? 'Miền Bắc' : p.region === 'south' ? 'Miền Nam' : 'Miền Trung'})
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown 2 & 3: Quận / Huyện & Phường / Xã */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            <Navigation size={13} color="#0284c7" /> Quận / Huyện
          </label>
          <select
            value={districtId}
            onChange={handleDistrictChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {currentProvince.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            <Home size={13} color="#0284c7" /> Phường / Xã
          </label>
          <select
            value={wardName}
            onChange={(e) => setWardName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {currentDistrict?.wards.map((w, idx) => (
              <option key={idx} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dropdown 4: Tuyến đường / Điểm giao hàng */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
          <MapPin size={13} color="#0284c7" /> Tuyến đường / Khu vực giao hàng
        </label>
        <select
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {(currentDistrict?.streets || ['Tuyến đường trung tâm phường/xã']).map((s, idx) => (
            <option key={idx} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Readonly Display: Địa chỉ giao hàng được chọn chuẩn */}
      <div
        style={{
          marginTop: '0.25rem',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          fontSize: '0.825rem',
          color: '#166534',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          lineHeight: 1.4,
        }}
      >
        <MapPin size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>
            Địa chỉ đặt hàng đã chọn:
          </span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            {value || 'Vui lòng chọn địa chỉ qua dropdown ở trên'}
          </span>
        </div>
      </div>
    </div>
  );
}
