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
  const [houseAddress, setHouseAddress] = useState(() => {
    const raw = initialParsed?.houseAddress || initialParsed?.streetName || '';
    return raw.toLowerCase().includes('tuyến đường trung tâm') ? '' : raw;
  });

  const lastEmittedValueRef = useRef(value || '');

  // Synchronize internal state when value changes from parent (e.g. loaded user profile or latest order)
  useEffect(() => {
    if (!value || value === lastEmittedValueRef.current) return;
    const parsed = parseAddressString(value);
    if (!parsed) return;

    if (parsed.provinceId) setProvinceId(parsed.provinceId);
    if (parsed.districtId) setDistrictId(parsed.districtId);
    if (parsed.wardName) setWardName(parsed.wardName);
    const parsedHouse = parsed.houseAddress || parsed.streetName || '';
    if (!parsedHouse.toLowerCase().includes('tuyến đường trung tâm')) {
      setHouseAddress(parsedHouse);
    }
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

  const notifyChange = (prov, dist, ward, house) => {
    const pName = prov?.name || '';
    const dName = dist?.name || '';
    const wName = ward || '';
    const hName = (house || '').trim();

    let full = '';
    if (hName) {
      full = `${hName}, ${wName}, ${dName}, ${pName}`;
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
      setDistrictId(newDistId);
      setWardName(newWard);
      notifyChange(newProv, firstDist, newWard, houseAddress);
    }
  };

  const handleDistrictChange = (e) => {
    const newDistId = e.target.value;
    setDistrictId(newDistId);
    const newDist = currentProvince.districts.find((d) => d.id === newDistId);
    if (newDist) {
      const newWard = newDist.wards[0] || '';
      setWardName(newWard);
      notifyChange(currentProvince, newDist, newWard, houseAddress);
    }
  };

  const handleWardChange = (e) => {
    const newWard = e.target.value;
    setWardName(newWard);
    notifyChange(currentProvince, currentDistrict, newWard, houseAddress);
  };

  const handleHouseChange = (e) => {
    const newHouse = e.target.value;
    setHouseAddress(newHouse);
    notifyChange(currentProvince, currentDistrict, wardName, newHouse);
  };

  // If initial value was completely empty, populate parent once with default selection
  useEffect(() => {
    if (!value && onChange) {
      notifyChange(currentProvince, currentDistrict, wardName, houseAddress);
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

      {/* Ô nhập Địa chỉ nhà (Số nhà, tên đường...) */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
          <Home size={13} color="#0284c7" /> Địa chỉ nhà
        </label>
        <input
          type="text"
          value={houseAddress}
          onChange={handleHouseChange}
          placeholder="vd: 111/21 đường 2/9, số nhà, tên đường..."
          maxLength={150}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            outline: 'none',
          }}
        />
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
          flexWrap: 'wrap',
        }}
      >
        <MapPin size={13} color="#0284c7" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Địa chỉ chọn:</span>
        <span style={{ fontStyle: 'italic', color: '#0369a1' }}>
          {houseAddress.trim()
            ? `${houseAddress.trim()}, ${wardName}, ${currentDistrict?.name}, ${currentProvince?.name}`
            : `${wardName}, ${currentDistrict?.name}, ${currentProvince?.name}`}
        </span>
      </div>
    </div>
  );
}
