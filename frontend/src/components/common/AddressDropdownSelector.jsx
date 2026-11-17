import { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Navigation, Building2, Home } from 'lucide-react';
import { VIETNAM_PROVINCES, parseAddressString } from '../../data/vietnamAddressData.js';

export default function AddressDropdownSelector({
  value,
  onChange,
  onRegionChange,
}) {
  const defaultProvince = VIETNAM_PROVINCES[0]; // Đà Nẵng
  const initialParsed = useMemo(() => parseAddressString(value), [value]);

  const [provinceId, setProvinceId] = useState(() => initialParsed?.provinceId || defaultProvince.id);
  const [districtId, setDistrictId] = useState(() => {
    if (initialParsed?.districtId) return initialParsed.districtId;
    const prov = VIETNAM_PROVINCES.find((p) => p.id === (initialParsed?.provinceId || defaultProvince.id));
    return prov?.districts[0]?.id || '';
  });
  const [wardName, setWardName] = useState(() => {
    if (initialParsed?.wardName) return initialParsed.wardName;
    const prov = VIETNAM_PROVINCES.find((p) => p.id === (initialParsed?.provinceId || defaultProvince.id));
    const dist = prov?.districts.find((d) => d.id === initialParsed?.districtId) || prov?.districts[0];
    return dist?.wards[0] || '';
  });
  const [streetName, setStreetName] = useState(() => {
    if (initialParsed?.streetName) return initialParsed.streetName;
    const prov = VIETNAM_PROVINCES.find((p) => p.id === (initialParsed?.provinceId || defaultProvince.id));
    const dist = prov?.districts.find((d) => d.id === initialParsed?.districtId) || prov?.districts[0];
    return dist?.streets?.[0] || 'Tuyến đường trung tâm';
  });

  const lastEmittedValueRef = useRef(value || '');

  // Synchronize internal dropdowns when value changes from parent (e.g. loaded user profile or latest order)
  useEffect(() => {
    if (!value || value === lastEmittedValueRef.current) return;
    const parsed = parseAddressString(value);
    if (!parsed) return;

    if (parsed.provinceId) setProvinceId(parsed.provinceId);
    if (parsed.districtId) setDistrictId(parsed.districtId);
    if (parsed.wardName) setWardName(parsed.wardName);
    if (parsed.streetName) setStreetName(parsed.streetName);
    lastEmittedValueRef.current = value;
  }, [value]);

  const currentProvince = useMemo(
    () => VIETNAM_PROVINCES.find((p) => p.id === provinceId) || defaultProvince,
    [provinceId, defaultProvince]
  );

  const currentDistrict = useMemo(
    () => currentProvince.districts.find((d) => d.id === districtId) || currentProvince.districts[0],
    [currentProvince, districtId]
  );

  const notifyChange = (prov, dist, ward, street) => {
    const pName = prov?.name || '';
    const dName = dist?.name || '';
    const wName = ward || '';
    const sName = street || '';

    let full = '';
    if (sName && !sName.toLowerCase().includes('tuyến đường trung tâm')) {
      full = `${sName}, ${wName}, ${dName}, ${pName}`;
    } else {
      full = `${wName}, ${dName}, ${pName}`;
    }

    lastEmittedValueRef.current = full;
    if (onChange) onChange(full, prov?.region);
    if (onRegionChange && prov?.region) onRegionChange(prov.region);
  };

  const handleProvinceChange = (e) => {
    const newProvId = e.target.value;
    setProvinceId(newProvId);
    const newProv = VIETNAM_PROVINCES.find((p) => p.id === newProvId);
    if (newProv) {
      const firstDist = newProv.districts[0];
      const newDistId = firstDist?.id || '';
      const newWard = firstDist?.wards[0] || '';
      const newStreet = firstDist?.streets?.[0] || 'Tuyến đường trung tâm';
      setDistrictId(newDistId);
      setWardName(newWard);
      setStreetName(newStreet);
      notifyChange(newProv, firstDist, newWard, newStreet);
    }
  };

  const handleDistrictChange = (e) => {
    const newDistId = e.target.value;
    setDistrictId(newDistId);
    const newDist = currentProvince.districts.find((d) => d.id === newDistId);
    if (newDist) {
      const newWard = newDist.wards[0] || '';
      const newStreet = newDist.streets?.[0] || 'Tuyến đường trung tâm';
      setWardName(newWard);
      setStreetName(newStreet);
      notifyChange(currentProvince, newDist, newWard, newStreet);
    }
  };

  const handleWardChange = (e) => {
    const newWard = e.target.value;
    setWardName(newWard);
    notifyChange(currentProvince, currentDistrict, newWard, streetName);
  };

  const handleStreetChange = (e) => {
    const newStreet = e.target.value;
    setStreetName(newStreet);
    notifyChange(currentProvince, currentDistrict, wardName, newStreet);
  };

  // If initial value was completely empty, populate parent once with default selection
  useEffect(() => {
    if (!value && onChange) {
      notifyChange(currentProvince, currentDistrict, wardName, streetName);
    }
  }, []);

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
            onChange={handleWardChange}
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
          onChange={handleStreetChange}
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

      {/* Live Preview Badge */}
      <div
        style={{
          padding: '0.45rem 0.75rem',
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <MapPin size={13} color="#0284c7" />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Địa chỉ chọn:</span>
        <span style={{ fontStyle: 'italic', color: '#0369a1' }}>
          {streetName && !streetName.toLowerCase().includes('tuyến đường trung tâm')
            ? `${streetName}, ${wardName}, ${currentDistrict?.name}, ${currentProvince?.name}`
            : `${wardName}, ${currentDistrict?.name}, ${currentProvince?.name}`}
        </span>
      </div>
    </div>
  );
}
