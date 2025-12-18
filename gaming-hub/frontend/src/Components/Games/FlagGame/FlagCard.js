import React from 'react';

const FlagCard = ({ country }) => {
    if (!country) return null;
    return (
        <div className="flag-card">
            <img src={country.flags.png} alt="Flag to guess" />
        </div>
    );
};

export default FlagCard;
