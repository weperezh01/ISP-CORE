const AccordionSection = ({ title, children, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={[styles.accordionHeader, { backgroundColor: isDarkMode ? '#333' : '#f4f4f4' }]}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={[styles.accordionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
            {title}
          </Text>
          <Text style={[styles.accordionToggle, { color: isDarkMode ? '#fff' : '#000' }]}>
            {isExpanded ? '-' : '+'}
          </Text>
        </TouchableOpacity>
        {isExpanded && <View style={styles.accordionContent}>{children}</View>}
      </View>
    );
  };
  
  const getAccordionStyles = (isDarkMode) => ({
    accordionContainer: {
      marginBottom: 10,
    },
    accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    accordionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    accordionToggle: {
      fontSize: 18,
    },
    accordionContent: {
      padding: 10,
      backgroundColor: isDarkMode ? '#444' : '#fff',
      borderRadius: 5,
    },
  });
  