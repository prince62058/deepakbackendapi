const { Company } = require("../models/companyModel");

const { fixData } = require("../utils/urlFixer");

// get company
const getCompany = async (req, res) => {
  try {
    const companyDetails = await Company.findOne();
    res.status(200).json({
      success: true,
      message: "Company details fetched successfully",
      data: fixData(companyDetails),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update company
const updateCompany = async (req, res) => {
  const { companyId } = req.query;
  const updatedData = { ...req.body };

  try {
    const company = await Company.findOne();
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    console.log("UpdateCompany Default Body:", req.body);
    console.log("UpdateCompany Files:", req.files);

    // Prevent body strings from overwriting images with "undefined" or old urls
    delete updatedData.icon;
    delete updatedData.favIcon;
    delete updatedData.loader;

    const icon = req.files?.icon?.[0]?.location;
    const favIcon = req.files?.favIcon?.[0]?.location;
    const loader = req.files?.loader?.[0]?.location;

    if (icon) {
      updatedData.icon = icon;
    }

    if (favIcon) {
      updatedData.favIcon = favIcon;
    }

    if (loader) {
      updatedData.loader = loader;
    }

    console.log("Final Updated Data:", updatedData);

    const data = await Company.findByIdAndUpdate(companyId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Company Data Updated Successfully",
      data: fixData(data),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCompany,
  updateCompany,
};
