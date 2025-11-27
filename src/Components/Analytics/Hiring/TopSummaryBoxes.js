import React from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const TopSummaryBoxes = () => {
    return (
        <div className="row top-summary-row">

            {/* 1️⃣ Total Hires */}
            <div className="col-sm-3">
                <div className="summary-box-fix">
                    <div className="box-title">Total Hires</div>
                    <div className="box-value">175</div>
                </div>
            </div>

            {/* 2️⃣ Attrition Count */}
            <div className="col-sm-3">
                <div className="summary-box-fix">
                    <div className="box-title">Attrition Count</div>
                    <div className="box-value">43</div>
                </div>
            </div>

            {/* 3️⃣ Employees Joined */}
            <div className="col-sm-3">
                <div className="summary-box-fix">
                    <div className="box-title">Employees Joined This Month</div>
                    <div className="box-value">
                        6 <FiArrowUp color="#008000" />
                    </div>
                    <div className="box-sub">
                        Sep 2024: 26 <br /> Aug 2024: 20
                    </div>
                </div>
            </div>

            {/* 4️⃣ Employees Left */}
            <div className="col-sm-3">
                <div className="summary-box-fix">
                    <div className="box-title">Employees Left This Month</div>
                    <div className="box-value">
                        5 <FiArrowDown color="#d60000" />
                    </div>
                    <div className="box-sub">
                        Sep 2024: 8 <br /> Aug 2024: 3
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TopSummaryBoxes;
