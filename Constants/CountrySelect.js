import { useState } from 'react';
import { Countries } from '@/Constants/data';

const CountrySelect = ({ selectedCountry, setSelectedCountry }) => {
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);

  const filteredCountries = Countries.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.dial_code.replace('+', '').includes(query.replace('+', ''))
  );

  const handleSelect = (country) => {
    setSelectedCountry(country);
    setQuery(`${country.flag} ${country.dial_code}`); // Show dial code + flag in input
    setShowList(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        placeholder="🇬🇭 +233 or Ghana"
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          fontSize: '1rem',
          color:"black",
          background:"white"
        }}
      />

      {showList && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ccc',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            minWidth:"250px"
          }}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <li
                key={country.code}
                onClick={() => handleSelect(country)}
                style={{
                  padding: '0.6rem 0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '1px solid #eee',
                  background: '#fff',
                  transition: 'background 0.2s',
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span style={{ marginLeft: 'auto' }}>{country.dial_code}</span>
              </li>
            ))
          ) : (
            <li style={{ padding: '0.75rem', color: '#777' }}>No matching country</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
