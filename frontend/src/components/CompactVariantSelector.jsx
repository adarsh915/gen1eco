const CompactVariantSelector = ({
  variants = [],
  selectedVariantId = null,
  onSelectVariant,
  disabled = false,
}) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return null;
  }

  if (variants.length === 1) {
    const singleVariant = variants[0];
    return (
      <div className="compact-variant compact-variant--single" aria-label="Selected variant">
        <span className="compact-variant__label">Option</span>
        <span className="compact-variant__value">
          {singleVariant.variant_value || singleVariant.variant_name || "Option"}
        </span>
      </div>
    );
  }

  return (
    <div className="compact-variant" role="group" aria-label="Select product option">
      {variants.slice(0, 4).map((variant) => {
        const isActive = selectedVariantId === variant.id;

        return (
          <button
            key={variant.id}
            type="button"
            className={`compact-variant__btn${isActive ? " compact-variant__btn--active" : ""}`}
            onClick={() => onSelectVariant?.(variant)}
            disabled={disabled}
            aria-pressed={isActive}
            title={variant.variant_name && variant.variant_value
              ? `${variant.variant_name}: ${variant.variant_value}`
              : (variant.variant_value || variant.variant_name || "Option")}
          >
            <span className="compact-variant__text">
              {variant.variant_value || variant.variant_name || "Option"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CompactVariantSelector;