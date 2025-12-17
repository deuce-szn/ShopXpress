import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import styled from 'styled-components';
import { colors } from './Colors';

const SelectorWrapper = styled.div`
  width: 30vw;
  margin-top: 10px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const customStyles = (colorMode) => ({
  control: (provided, state) => ({
    ...provided,
    padding: '15px 10px',
    border: `1px solid ${colorMode}`,
    color: colorMode,
    backgroundColor: 'white',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.5s ease-in-out',
    '&:hover': {
      border: `0.5px solid ${colors.primary}`,
    },
    '&:focus': {
      border: `0.5px solid ${colors.primary}`,
    }
  }),
  menu: (provided) => ({
    ...provided,
    color: colorMode,
    backgroundColor: 'white',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? colors.primary : colorMode,
    backgroundColor: state.isSelected ? 'white' : 'white',
    '&:hover': {
      backgroundColor: colors.primary,
      color: 'white',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: colorMode,
  }),
  input: (provided) => ({
    ...provided,
    color: colorMode,
  })
});

const Selector = ({ setMethod, dataList, placeholder, dataKey, dataValue }) => {
  const [colorMode, setColorMode] = useState('black'); // Default color

  useEffect(() => {
    // Access localStorage only on client-side
     const mode = localStorage.getItem("colorMode") || 'black';
      setColorMode(mode);
  }, []); // Runs once after the component is mounted

  const handleChange = (selectedOption) => {
    setMethod(selectedOption.value);
  };

  const options = Array.isArray(dataList) ? dataList.map((data) => ({
    value: data[dataKey],
    label: data[dataValue]
  })) : [];

  return (
    <SelectorWrapper>
      <Select
        styles={customStyles(colorMode)}  // Pass colorMode to customStyles
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
        isSearchable
      />
    </SelectorWrapper>
  );
};

Selector.propTypes = {
  setMethod: PropTypes.func.isRequired,
  dataList: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  dataKey: PropTypes.string.isRequired,
  dataValue: PropTypes.string.isRequired,
};

Selector.defaultProps = {
  placeholder: 'Select an option',
};

export default Selector;
