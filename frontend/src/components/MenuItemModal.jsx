import { useEffect, useMemo, useState } from "react";

import { useCart } from "../context/CartContext";
import { getMenuItemOptions } from "../services/menuService";

function MenuItemModal({ item, onClose }) {
  const { addToCart } = useCart();

  const [optionGroups, setOptionGroups] = useState([]);
  const [selections, setSelections] = useState({});
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const groups = await getMenuItemOptions(item.id);

        setOptionGroups(groups);

        const defaults = {};

        groups.forEach((group) => {
          const defaultOptions = group.options.filter(
            (option) => option.isDefault,
          );

          if (group.selectionType === "single") {
            defaults[group.id] = defaultOptions[0]?.id ?? null;
          } else {
            defaults[group.id] = defaultOptions.map((option) => option.id);
          }
        });

        setSelections(defaults);
      } catch (err) {
        console.error(err);
        setError("Customization options could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [item.id]);

  function handleSingle(groupId, optionId) {
    setSelections((current) => ({
      ...current,
      [groupId]: optionId,
    }));
  }

  function handleMultiple(groupId, optionId) {
    setSelections((current) => {
      const selected = current[groupId] || [];

      const exists = selected.includes(optionId);

      return {
        ...current,
        [groupId]: exists
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
    });
  }

  const selectedOptions = useMemo(() => {
    const result = [];

    optionGroups.forEach((group) => {
      const selected = selections[group.id];

      group.options.forEach((option) => {
        const isSelected =
          group.selectionType === "single"
            ? selected === option.id
            : selected?.includes(option.id);

        if (isSelected) {
          result.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceAdjustment: Number(option.priceAdjustment),
          });
        }
      });
    });

    return result;
  }, [optionGroups, selections]);

  const basePrice =
    item.specialPrice !== null && item.specialPrice !== undefined
      ? Number(item.specialPrice)
      : Number(item.price);

  const finalPrice = useMemo(() => {
    return selectedOptions.reduce(
      (total, option) => total + option.priceAdjustment,
      basePrice,
    );
  }, [selectedOptions, basePrice]);

  function handleAddToCart() {
    for (const group of optionGroups) {
      if (!group.isRequired) continue;

      const selection = selections[group.id];

      const missing =
        group.selectionType === "single"
          ? !selection
          : !selection || selection.length < group.minSelections;

      if (missing) {
        setError(`Please select an option for ${group.name}.`);
        return;
      }
    }

    addToCart({
      ...item,
      selectedOptions,
      specialInstructions: instructions.trim(),
      calculatedPrice: finalPrice,
    });

    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="item-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2>{item.name}</h2>

        <p>{item.description}</p>

        {loading && <p>Loading options...</p>}

        {error && <div className="form-error">{error}</div>}

        {!loading &&
          optionGroups.map((group) => (
            <fieldset key={group.id} className="option-group">
              <legend>
                {group.name}

                {group.isRequired && <span> *</span>}
              </legend>

              {group.options.map((option) => {
                const checked =
                  group.selectionType === "single"
                    ? selections[group.id] === option.id
                    : selections[group.id]?.includes(option.id);

                return (
                  <label key={option.id} className="option-row">
                    <span>
                      <input
                        type={
                          group.selectionType === "single"
                            ? "radio"
                            : "checkbox"
                        }
                        name={`group-${group.id}`}
                        checked={Boolean(checked)}
                        onChange={() =>
                          group.selectionType === "single"
                            ? handleSingle(group.id, option.id)
                            : handleMultiple(group.id, option.id)
                        }
                      />

                      {option.name}
                    </span>

                    {Number(option.priceAdjustment) > 0 && (
                      <span>
                        +$
                        {Number(option.priceAdjustment).toFixed(2)}
                      </span>
                    )}
                  </label>
                );
              })}
            </fieldset>
          ))}

        {!loading && (
          <>
            <div className="form-group">
              <label htmlFor="itemInstructions">Special Instructions</label>

              <textarea
                id="itemInstructions"
                rows="3"
                placeholder="Light ice, no whipped cream..."
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="button button-primary modal-add-button"
              onClick={handleAddToCart}
            >
              Add to Cart — ${finalPrice.toFixed(2)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MenuItemModal;
