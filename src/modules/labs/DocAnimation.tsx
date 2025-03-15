import { useEffect, useState } from "react";

const StreamingBlurText = () => {
  const [showTitles, setShowTitles] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [visibleText, setVisibleText] = useState({
    summary: "",
    changeLog: "",
    technicalDetails: "",
  });

  const texts = {
    summary: `The "Inbound Delivery" workflow is designed to automate the notification process for return package deliveries within the Oomnitza system. This workflow is triggered when a return order ticket number is present, the asset status is "Return Pending (I)", and a tracking number is available with FedEx as the shipping carrier. Upon these conditions being met, the system sends a notification and email to specified recipients, confirming the delivery of the return package. This ensures timely communication and efficient handling of return processes, reducing manual intervention and potential errors.`,
    
    changeLog: `Change Date | Changed By | Description of Change
October 27, 2024 10:23:18 | Migration Tool | Initial creation of the "Inbound Delivery" workflow configuration.
October 27, 2024 10:23:18 | Migration Tool | Initial creation of the "Inbound Delivery" workflow configuration.
October 27, 2024 10:23:18 | Migration Tool | Initial creation of the "Inbound Delivery" workflow configuration.`,

    technicalDetails: `Component | Details
Entry Point | Checks for non-null return order ticket number, status "Return Pending (I)", and non-null tracking number with FedEx as the carrier.
Notify Block | Sends notifications and emails to specified users and external addresses. Includes dynamic fields such as {{assigned_to}}, {{return_order_ticket_number}}, and {{model}}.
Notify Block | Sends notifications and emails to specified users and external addresses. Includes dynamic fields such as {{assigned_to}}, {{return_order_ticket_number}}, and {{model}}.
End Point | Marks the completion of the workflow after notifications are sent.`,
  };

  useEffect(() => {
    // Fade in all titles at once
    setTimeout(() => setShowTitles(true), 500);

    // Fade in tables 500ms after titles appear
    setTimeout(() => setShowTables(true), 1000);

    // Start streaming text 500ms after tables appear
    setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= texts.summary.length) {
          setVisibleText((prev) => ({
            ...prev,
            summary: texts.summary.slice(0, index),
          }));
        }
        if (index <= texts.changeLog.length) {
          setVisibleText((prev) => ({
            ...prev,
            changeLog: texts.changeLog.slice(0, index),
          }));
        }
        if (index <= texts.technicalDetails.length) {
          setVisibleText((prev) => ({
            ...prev,
            technicalDetails: texts.technicalDetails.slice(0, index),
          }));
        }
        index++;

        if (
          index > texts.summary.length &&
          index > texts.changeLog.length &&
          index > texts.technicalDetails.length
        ) {
          clearInterval(interval);
        }
      }, 10); // Faster streaming effect

      return () => clearInterval(interval);
    }, 1500); // Start text streaming 1.5s after titles appear
  }, []);

  const pageStyle = `
    .container {
      font-family: Arial, sans-serif;
      margin: 0 auto;
      padding: 40px;
      width: 900px;
    }

    h1, h2 {
      color: #333;
      margin-top: 30px;
      margin-bottom: 20px;
      opacity: 0;
      transition: opacity 1s ease-in;
      font-weight: bold;
    }

    .visible {
      opacity: 1;
    }

    .table-container {
      opacity: 0;
      transition: opacity 1s ease-in;
    }

    .table-container.visible {
      opacity: 1;
    }

    .streaming-text {
      font-size: 16px;
      color: black;
      filter: blur(3px); /* Keep text blurred */
      white-space: pre-wrap;
      overflow: hidden;
    }

    table {
      border-collapse: collapse;
      width: 100%;
    }

    table, th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

    /* Streaming effect for individual letters */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .streaming-text span, table td span {
      opacity: 0;
      animation: fadeIn 0.5s ease-in forwards;
    }

    .streaming-text span:nth-child(1), table td span:nth-child(1) { animation-delay: 0s; }
    .streaming-text span:nth-child(2), table td span:nth-child(2) { animation-delay: 0.005s; }
    .streaming-text span:nth-child(3), table td span:nth-child(3) { animation-delay: 0.01s; }
    .streaming-text span:nth-child(4), table td span:nth-child(4) { animation-delay: 0.015s; }
  `;

  return (
    <div className="flex w-full">
      <style>{pageStyle}</style>
      <div className="container">
        {/* Titles fade in all at once */}
        <h1 className={showTitles ? "visible" : ""}>
          Oomnitza Configuration Documentation
        </h1>

        <h2 className={showTitles ? "visible" : ""}>1. Summary</h2>
        <p className="streaming-text">
          {visibleText.summary.split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </p>

        {/* Tables fade in after titles */}
        <div className={`table-container ${showTables ? "visible" : ""}`}>
          <h2 className={showTitles ? "visible" : ""}>2. Change Log</h2>
          <table>
            <thead>
              <tr className="streaming-text">
                <th>Change Date</th>
                <th>Changed By</th>
                <th>Description of Change</th>
              </tr>
            </thead>
            <tbody>
              {visibleText.changeLog.split("\n").map((line, index) => (
                <tr key={index} className="streaming-text">
                  {line.split(" | ").map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cell.split("").map((char, charIndex) => (
                        <span key={charIndex}>{char}</span>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className={showTitles ? "visible" : ""}>3. Technical Details</h2>
          <table>
            <thead>
              <tr className="streaming-text">
                <th>Component</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleText.technicalDetails.split("\n").map((line, index) => (
                <tr key={index} className="streaming-text">
                  {line.split(" | ").map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cell.split("").map((char, charIndex) => (
                        <span key={charIndex}>{char}</span>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StreamingBlurText;
