import Action from "../../models/Action.model.js";
import UserType from "../../models/UserType.model.js";
import Card from "../../models/Card.model.js";
import translateText from "../../utils/translation.js";

export const get_Cards = async (req, res) => {
  try {
    const { headline, language } = req.params;

    // Find all cards matching the headline
    const cards = await Card.find({ headline });

    if (!cards || cards.length === 0) {
      return res
        .status(404)
        .json({ message: `No cards found with headline: ${headline}` });
    }

    // Translate description and name
    const translatedCards = await Promise.all(
      cards.map(async (card) => {
        const translatedDescription = await translateText(
          card.description,
          language
        );

        const translatedName = await translateText(card.name, language);

        return {
          ...card.toObject(),
          description: translatedDescription || card.description,
          name: translatedName || card.name,
        };
      })
    );

    res.status(200).json(translatedCards);
  } catch (error) {
    console.error("Error fetching or translating cards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_action = async (req, res) => {
  try {
    const { usertype, language } = req.params;

    if (!usertype) {
      return res.status(400).json({ message: "Usertype is required" });
    }

    if (!language) {
      return res.status(400).json({ message: "Language is required" });
    }

    const actions = await Action.find({ usertype });

    if (actions.length === 0) {
      return res
        .status(404)
        .json({ message: "No actions found for this usertype" });
    }

    const translatedActions = await Promise.all(
      actions.map(async (action) => {
        try {
          const translatedDescription = await translateText(
            action.description,
            language
          );
          const translatedName = await translateText(action.action, language);
          const translatedUserType = await translateText(
            action.usertype,
            language
          );

          return {
            ...action.toObject(),
            description: translatedDescription || action.description,
            action: translatedName || action.action,
            usertype: translatedUserType || action.usertype, // fallback if translation fails
          };
        } catch (translationError) {
          console.error("Translation error:", translationError);
          return {
            ...action.toObject(),
            description: action.description, // fallback to original if translation fails
            action: action.action, // fallback to original if translation fails
            usertype: action.usertype, // fallback to original if translation fails
          };
        }
      })
    );

    res.status(200).json(translatedActions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const get_userType = async (req, res) => {
  try {
    console.log("....");

    const language = req.params.language || "en"; // ✅ Get from route params
    console.log("Requested language:", language);

    const userType = await UserType.find();

    const translatedUserType = await Promise.all(
      userType.map(async (user) => {
        const translatedName = await translateText(user.name, language);
        console.log(translatedName, "translatedName");

        return { ...user.toObject(), name: translatedName }; // return new object
      })
    );
    console.log("translatedUserType", translatedUserType);

    res.status(200).json(translatedUserType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_searchCard = async (req, res) => {
  console.log(req.query, "req.query");

  try {
    const query = req.query.query;
    const language = req.params.language || "en"; // Language comes from URL parameter, default to "en"

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Case-insensitive partial match on name
    const cards = await Card.find({
      name: { $regex: query, $options: "i" },
    });

    const translatedCards = await Promise.all(
      cards.map(async (card) => {
        const translatedName = await translateText(card.name, language);
        const translatedDescription = await translateText(
          card.description,
          language
        );

        return {
          ...card.toObject(),
          name: translatedName || card.name,
          description: translatedDescription || card.description,
        };
      })
    );

    res.status(200).json(translatedCards);
  } catch (error) {
    console.error("Error searching and translating cards:", error);
    res.status(500).json({ message: error.message });
  }
};
