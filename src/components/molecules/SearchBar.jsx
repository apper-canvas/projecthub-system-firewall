import React from "react";
import Input from "@/components/atoms/Input";

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  return (
    <Input
      type="text"
      icon="Search"
      iconPosition="left"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

export default SearchBar;